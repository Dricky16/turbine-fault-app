import { GoogleGenAI } from '@google/genai';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const { imageData } = req.body;
    if (!imageData) return res.status(400).json({ error: 'No image data provided' });
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [
        { role: 'user', parts: [
            { text: "Identify this perfume bottle. Just reply with the brand name and the perfume name, like 'Creed Aventus' or 'Dior Sauvage'. Nothing else." },
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }
          ]
        }
      ]
    });
    const rawText = response.text || (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) || "";
    if (!rawText) {
      console.error("Gemini returned empty or blocked response:", JSON.stringify(response));
      return res.status(500).json({ error: 'Image analysis blocked or returned no text. Please try again.' });
    }
    const identifiedName = rawText.trim();
    res.json({ name: identifiedName });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
}
