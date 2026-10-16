import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const secretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;
    if (!secretKey) {
      return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY on server' });
    }

    const userId = req.method === 'GET' ? req.query.userId : req.body?.userId;
    const isStatusCheck = req.method === 'GET' || req.body?.action === 'status';

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const stripe = new Stripe(secretKey);
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    );

    // 1. Fetch user profile from Supabase
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, tier')
      .eq('id', userId)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id;
    let targetSubscription = null;

    // 2. If customerId is known, look up their subscriptions
    if (customerId) {
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 10
      });
      targetSubscription = subs.data.find(s => s.status === 'active' || s.status === 'trialing');
    }

    // 3. Fallback: If no customerId or no subscription found, search by user email from auth
    if (!targetSubscription) {
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        if (authUser?.user?.email) {
          const customers = await stripe.customers.list({
            email: authUser.user.email,
            limit: 5
          });
          for (const cust of customers.data) {
            const custSubs = await stripe.subscriptions.list({
              customer: cust.id,
              status: 'all',
              limit: 5
            });
            const active = custSubs.data.find(s => s.status === 'active' || s.status === 'trialing');
            if (active) {
              customerId = cust.id;
              targetSubscription = active;
              // Save customerId back to profile for future requests
              await supabase.from('profiles').update({ stripe_customer_id: cust.id }).eq('id', userId);
              break;
            }
          }
        }
      } catch (authErr) {
        console.warn('Auth admin lookup failed:', authErr.message);
      }
    }

    // 4. Fallback 2: Search recent subscriptions matching metadata.userId
    if (!targetSubscription) {
      const recentSubs = await stripe.subscriptions.list({
        limit: 50,
        status: 'all'
      });
      targetSubscription = recentSubs.data.find(s => 
        (s.metadata?.userId === userId || s.metadata?.user_id === userId) && 
        (s.status === 'active' || s.status === 'trialing')
      );
      if (targetSubscription && !customerId) {
        customerId = targetSubscription.customer;
        await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId);
      }
    }

    if (!targetSubscription) {
      return res.status(404).json({ 
        error: 'No active subscription found. If you believe this is an error, please contact support.' 
      });
    }

    const periodEndMs = (targetSubscription.current_period_end || targetSubscription.cancel_at) * 1000;
    const formattedDate = new Date(periodEndMs).toLocaleDateString('en-IE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // If just checking status, return current status without modifying Stripe
    if (isStatusCheck) {
      return res.json({
        active: targetSubscription.status === 'active' || targetSubscription.status === 'trialing',
        cancelAtPeriodEnd: Boolean(targetSubscription.cancel_at_period_end),
        endsAt: formattedDate,
        subscriptionId: targetSubscription.id
      });
    }

    // 5. Update subscription to cancel at the end of the current billing period
    const updatedSub = await stripe.subscriptions.update(targetSubscription.id, {
      cancel_at_period_end: true
    });

    const updatedEndMs = (updatedSub.current_period_end || updatedSub.cancel_at) * 1000;
    const updatedFormattedDate = new Date(updatedEndMs).toLocaleDateString('en-IE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return res.json({
      success: true,
      cancelAtPeriodEnd: true,
      endsAt: updatedFormattedDate,
      subscriptionId: updatedSub.id
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process subscription request' });
  }
}
