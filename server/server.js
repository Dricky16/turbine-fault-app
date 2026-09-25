import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

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

app.listen(port, () => {
  console.log(`Secure Backend Server running on http://localhost:${port}`);
});
