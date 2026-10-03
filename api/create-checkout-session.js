import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { userId, priceId } = req.body;
    const origin = req.headers.origin || 'http://localhost:5173';
    
    if (!priceId) {
      throw new Error('No price ID provided');
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/?success=true&userId=${userId}`,
      cancel_url: `${origin}/`,
      metadata: { userId },
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
}
