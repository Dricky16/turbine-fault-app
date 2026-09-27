import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);
    const { userId } = req.body;
    const origin = req.headers.origin || 'http://localhost:5173';
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: process.env.VITE_STRIPE_PRICE_ID, quantity: 1 }],
      mode: 'payment',
      success_url: `${origin}/?success=true&userId=${userId}`,
      cancel_url: `${origin}/`,
      metadata: { userId },
    });
    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
}
