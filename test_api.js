import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });
const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });
async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemma-4-26b-a4b-it',
      contents: [
        {
          role: 'user',
          parts: [
            { text: "What is this a picture of?" },
            { inlineData: { mimeType: 'image/jpeg', data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" } }
          ]
        }
      ]
    });
    console.log("Gemma says:", response.text);
  } catch (e) {
    console.log("Gemma error:", e.message);
  }
}
run();
