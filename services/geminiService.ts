import { GoogleGenAI } from "@google/genai";
import { NetworkInsight } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini
// Note: We create the client lazily to ensure environment variables are loaded,
// though in this setup they should be available globally.
const getAiClient = () => new GoogleGenAI({ apiKey });

export const getNetworkInsights = async (ip: string, isLocal: boolean): Promise<NetworkInsight[]> => {
  if (!apiKey) {
    return [
      {
        type: 'technical',
        content: 'API Key not configured. AI insights are disabled.'
      }
    ];
  }

  try {
    const ai = getAiClient();
    const prompt = `
      I have an IP address: ${ip}. It is a ${isLocal ? 'private/local' : 'public'} address.
      Provide 3 short, interesting insights about this kind of IP address or networking in general.
      Format the response as a JSON array of objects with keys: "type" (one of "security", "fact", "technical") and "content" (string).
      Keep it brief and user-friendly.
      Example:
      [
        {"type": "fact", "content": "192.168.x.x addresses are reserved for private networks."},
        {"type": "security", "content": "Keep your router firmware updated to protect your local network."}
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as NetworkInsight[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [
      {
        type: 'technical',
        content: 'Unable to fetch AI insights at this moment.'
      }
    ];
  }
};