import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);

async function run() {
  try {
    const price = await stripe.prices.retrieve(process.env.VITE_STRIPE_PRICE_ID);
    console.log("Price found:", price.id);
  } catch (err) {
    console.error("Error retrieving price:", err.message);
    const prices = await stripe.prices.list({ limit: 10 });
    console.log("Available prices:", prices.data.map(p => p.id));
  }
}
run();
