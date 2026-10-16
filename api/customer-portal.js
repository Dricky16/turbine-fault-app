import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const secretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;
    if (!secretKey) {
      return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY on server' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const stripe = new Stripe(secretKey);
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      // Look up by user email
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        if (authUser?.user?.email) {
          const customers = await stripe.customers.list({ email: authUser.user.email, limit: 1 });
          if (customers.data.length > 0) {
            customerId = customers.data[0].id;
            await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId);
          }
        }
      } catch (e) {}
    }

    if (!customerId) {
      return res.status(404).json({ error: 'No active billing profile found.' });
    }

    const origin = req.headers.origin || 'https://scentsforcents.ie';
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/`,
    });

    return res.json({ url: portalSession.url });

  } catch (error) {
    console.error('Customer portal error:', error);
    return res.status(500).json({ error: error.message || 'Failed to open customer portal' });
  }
}
