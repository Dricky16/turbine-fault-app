import fs from 'fs';

let content = fs.readFileSync('server/server.js', 'utf8');

const importTarget = `import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';`;

const importReplacement = `import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';`;

content = content.replace(importTarget, importReplacement);

const aiTarget = `const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });`;

const aiReplacement = `const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY); // Or service role
`;

content = content.replace(aiTarget, aiReplacement);

const newRoutes = `

// --- Stripe Checkout Route ---
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.VITE_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:5173/?success=true&userId=' + userId,
      cancel_url: 'http://localhost:5173/',
      client_reference_id: userId,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Simple Upgrade Route (for Local Testing) ---
app.post('/api/upgrade-success', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing user ID" });
    
    // In production, you MUST use Stripe Webhooks to do this securely. 
    // This is just a simple shortcut for local testing.
    
    // Actually we need the Service Role key to bypass RLS if it was on, but it's disabled.
    const { error } = await supabase
      .from('profiles')
      .update({ tier: 'premium' })
      .eq('id', userId);
      
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error("Upgrade error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen`;

content = content.replace("app.listen", newRoutes);

fs.writeFileSync('server/server.js', content);
