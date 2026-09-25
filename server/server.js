import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const app = express();
const port = 3001;

// Enable CORS so the React frontend can talk to this server
app.use(cors());

// Increase JSON payload limit because base64 images can be large
app.use(express.json({ limit: '10mb' }));

// Initialize the Google Gemini AI securely on the backend
const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY); // Or service role


app.post('/api/analyze', async (req, res) => {
  try {
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided.' });
    }

    const base64Data = imageData.split(',')[1] || imageData;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: "Analyze this image of a perfume bottle. What is the core name of the perfume? Respond ONLY with the core name of the perfume. CRITICAL: Do NOT include concentration types like 'Eau de Parfum', 'EDP', 'Eau de Toilette', 'EDT', 'Parfum', 'Cologne', or 'Intense'. Do NOT include the brand name unless it is strictly part of the fragrance name. For example, if the bottle says 'Giorgio Armani Acqua di Gio Eau de Toilette', respond with exactly 'Acqua Di Gio'. If you absolutely cannot identify it, respond with 'UNKNOWN'."
              },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Data
                }
              }
            ]
          }
        ]
      });
    } catch (primaryErr) {
      console.warn("Primary model failed, attempting fallback to gemma...");
      // Fallback to older stable model if the new one is too busy
      response = await ai.models.generateContent({
        model: 'gemma-4-26b-a4b-it',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: "Analyze this image of a perfume bottle. What is the core name of the perfume? Respond ONLY with the core name of the perfume. CRITICAL: Do NOT include concentration types like 'Eau de Parfum', 'EDP', 'Eau de Toilette', 'EDT', 'Parfum', 'Cologne', or 'Intense'. Do NOT include the brand name unless it is strictly part of the fragrance name. For example, if the bottle says 'Giorgio Armani Acqua di Gio Eau de Toilette', respond with exactly 'Acqua Di Gio'. If you absolutely cannot identify it, respond with 'UNKNOWN'."
              },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Data
                }
              }
            ]
          }
        ]
      });
    }

    const identifiedName = response.text.trim();
    res.json({ name: identifiedName });

  } catch (err) {
    console.error("AI processing error:", err);
    let errorMessage = "An error occurred while analyzing the image. Please try again.";
    
    try {
      if (err.message && err.message.includes('{')) {
        const jsonError = JSON.parse(err.message.substring(err.message.indexOf('{')));
        if (jsonError.error && jsonError.error.message) {
          errorMessage = jsonError.error.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
    } catch (e) {}
    
    if (errorMessage.includes("high demand") || errorMessage.includes("503")) {
      errorMessage = "Google's AI servers are currently experiencing very high demand. Please wait a few seconds and try again.";
    }
    
    res.status(500).json({ error: errorMessage });
  }
});



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

app.listen(port, () => {
  console.log(`Secure Backend Server running on http://localhost:${port}`);
});
