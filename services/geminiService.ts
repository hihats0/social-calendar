import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// Using the environment variable as required
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateBirthdayWish = async (name: string, handle: string): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key not found");
    return "Happy Birthday! 🎉";
  }

  try {
    const model = "gemini-2.5-flash";
    const prompt = `Write a short, fun, and witty birthday tweet for a user named "${name}" (twitter handle: @${handle}). Include emojis. Max 280 chars.`;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Happy Birthday! 🎂";
  } catch (error) {
    console.error("Error generating wish:", error);
    return "Happy Birthday! 🎈";
  }
};
