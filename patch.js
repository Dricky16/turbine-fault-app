import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

const target = `    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key is missing. Please add it to your .env.local file.");
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });

      // Convert base64 data URL (data:image/jpeg;base64,...) to raw base64 string
      const base64Data = imageData.split(',')[1];

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: "Analyze this image of a perfume bottle. What is the exact brand name and the perfume name? Respond ONLY with the name of the perfume. For example, if it is 'Chanel No 5', respond with exactly 'Chanel No 5'. Do not include the brand name unless it is part of the fragrance name. If you absolutely cannot identify it, respond with 'UNKNOWN'."
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
        console.warn("Primary model failed, attempting fallback...", primaryErr);
        // Fallback to older stable model if the new one is too busy
        response = await ai.models.generateContent({
          model: 'gemma-4-26b-a4b-it',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: "Analyze this image of a perfume bottle. What is the exact brand name and the perfume name? Respond ONLY with the name of the perfume. For example, if it is 'Chanel No 5', respond with exactly 'Chanel No 5'. Do not include the brand name unless it is part of the fragrance name. If you absolutely cannot identify it, respond with 'UNKNOWN'."
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
      
      if (identifiedName === 'UNKNOWN') {
        setError("Could not clearly identify the perfume. Please try taking a clearer photo.");
        setLoading(false);
        return;
      }

      console.log("Identified perfume:", identifiedName);
      
      // Execute the normal search flow using the AI's answer
      await executeSearch(identifiedName);

    } catch (err) {
      console.error("AI processing error:", err);
      let errorMessage = "An error occurred while analyzing the image. Please try again.";
      
      // Try to parse raw JSON errors from the API
      try {
        if (err.message && err.message.includes('{')) {
          const jsonError = JSON.parse(err.message.substring(err.message.indexOf('{')));
          if (jsonError.error && jsonError.error.message) {
            errorMessage = jsonError.error.message;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
      } catch (e) {
        // Ignore parsing errors
      }
      
      if (errorMessage.includes("high demand") || errorMessage.includes("503")) {
        errorMessage = "Google's AI servers are currently experiencing very high demand. Please wait a few seconds and try again.";
      }
      
      setError(errorMessage);
      setLoading(false);
    }`;

const replacement = `    try {
      // Send the image to our secure backend server
      const res = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageData })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze image');
      }

      const identifiedName = data.name;
      
      if (identifiedName === 'UNKNOWN') {
        setError("Could not clearly identify the perfume. Please try taking a clearer photo.");
        setLoading(false);
        return;
      }

      console.log("Identified perfume:", identifiedName);
      
      // Execute the normal search flow using the AI's answer
      await executeSearch(identifiedName);

    } catch (err) {
      console.error("AI processing error:", err);
      setError(err.message || "An error occurred while analyzing the image. Please try again.");
      setLoading(false);
    }`;

content = content.replace(target, replacement);

// Also remove GoogleGenAI import since we don't need it on the frontend anymore
content = content.replace("import { GoogleGenAI } from '@google/genai';\n", "");

fs.writeFileSync('src/App.jsx', content);
