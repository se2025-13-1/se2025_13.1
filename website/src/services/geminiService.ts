import { GoogleGenAI } from "@google/genai";

// Use Vite's import.meta.env for environment variables (not process.env)
// Set VITE_GEMINI_API_KEY in .env file
const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || "";

// Initialize only if key exists to prevent errors during render if config is missing
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateProductDescription = async (
  productName: string,
  category: string,
  keywords: string
): Promise<string> => {
  if (!ai) {
    console.warn(
      "Gemini API Key is missing. Set VITE_GEMINI_API_KEY in .env file."
    );
    return "AI generation unavailable. Please configure VITE_GEMINI_API_KEY.";
  }

  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      You are a professional copywriter for a fashion e-commerce store.
      Write a catchy, short (max 3 sentences), and SEO-friendly product description for a clothing item.
      
      Product Name: ${productName}
      Category: ${category}
      Keywords/Features: ${keywords}
      
      Return only the description text.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    // Type-safe access to response text - GoogleGenAI returns text directly on response
    const text = (response as any)?.text?.trim?.() || "";

    if (!text) {
      console.error("Empty response from Gemini API", response);
      return "Failed to generate description. Empty response from API.";
    }

    return text;
  } catch (error) {
    console.error("Error generating description:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return `Failed to generate description: ${errorMsg}`;
  }
};
