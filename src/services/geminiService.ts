import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not defined. AI features will be unavailable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "" });

export type Message = {
  role: "user" | "model";
  parts: { text: string }[];
};

export const geminiService = {
  async chat(history: Message[], message: string) {
    if (!API_KEY) throw new Error("API Key missing");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [...history, { role: "user", parts: [{ text: message }] }],
      config: {
        systemInstruction: `You are Lumina AI, a highly intelligent, detailed, and human-like assistant. 
        Core behavior:
        - Provide clear, structured, and deeply explained answers.
        - Adapt tone to the user's style.
        - Explain complex concepts simply.
        - Think critically and provide multiple perspectives.
        - Never give shallow responses unless requested.
        - For coding, provide clean, optimized code.
        - You can assist with business, creativity, trading, and more.`,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      },
    });

    return response.text;
  },

  async generateImagePrompt(description: string) {
    if (!API_KEY) throw new Error("API Key missing");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a highly detailed visual prompt for an AI image generator based on this description: "${description}". 
      Follow this format: Subject + Environment + Lighting + Camera + Style + Mood + Details + Quality Enhancements.
      Return ONLY the prompt string, no explanations.`,
    });

    return response.text;
  },

  async generateImage(prompt: string) {
    if (!API_KEY) throw new Error("API Key missing");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  }
};
