import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;
    if (!secretKey) {
      return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY on server' });
    }
    const stripe = new Stripe(secretKey);
    const { userId, priceId } = req.body;
    const origin = req.headers.origin || 'https://scentsforcents.ie';
    
    if (!priceId) {
      throw new Error('No price ID provided');
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/?success=true&userId=${userId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: { userId },
      subscription_data: {
        metadata: { userId }
      }
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
}
