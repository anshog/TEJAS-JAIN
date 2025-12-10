import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateColoringPage = async (prompt: string): Promise<string> => {
  try {
    const finalPrompt = `A clean, simple, black and white line art coloring page for children of ${prompt}. White background, thick distinct lines, no shading, no gradients, vector style. High contrast.`;
    
    // Using gemini-2.5-flash-image for generation as per instructions for general image tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: finalPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    // Extract base64 image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};