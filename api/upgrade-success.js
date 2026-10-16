import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
    const { userId, sessionId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const updates = { tier: 'premium' };

    // If Stripe session ID is present, fetch the customer ID
    if (sessionId) {
      try {
        const secretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;
        if (secretKey) {
          const stripe = new Stripe(secretKey);
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          if (session?.customer) {
            updates.stripe_customer_id = session.customer;
          }
        }
      } catch (stripeErr) {
        console.warn('Could not retrieve Stripe session details:', stripeErr.message);
      }
    }

    await supabase.from('profiles').update(updates).eq('id', userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Upgrade success error:', error);
    res.status(500).json({ error: error.message });
  }
}

