import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../types';

// We do NOT initialize 'ai' at the top level anymore.
// This prevents the "White Screen" crash if the API key is missing/undefined when the app loads.

export const generateQuestions = async (topic: string, subTopic: string = '', count: number = 15): Promise<Question[]> => {
  try {
    // Access the key using Vite's standard method
    // Note: You must name your environment variable VITE_API_KEY in Vercel/Netlify/Local
    const apiKey = import.meta.env.VITE_API_KEY;

    if (!apiKey) {
      throw new Error("API Key is missing. Please check your settings and ensure 'VITE_API_KEY' is set.");
    }

    // Initialize the AI client only when needed
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Generate ${count} multiple-choice questions about "${topic}"${subTopic ? ` specifically focusing on "${subTopic}"` : ''} for a "Who Wants to Be a Millionaire" game. 
      The questions must range from very easy (for the first 5), medium (next 5), to very hard (last 5).
      Provide 4 options for each question. Ensure the correct answer is accurate.
      Language: Indonesian (Bahasa Indonesia).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                minItems: 4,
                maxItems: 4 
              },
              correctAnswerIndex: { 
                type: Type.INTEGER, 
                description: "The index (0-3) of the correct option." 
              },
              difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] },
              explanation: { type: Type.STRING, description: "Short explanation of why the answer is correct." }
            },
            required: ["question", "options", "correctAnswerIndex", "difficulty"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text) as Question[];
    return data;
  } catch (error) {
    console.error("Failed to generate questions:", error);
    throw error;
  }
};