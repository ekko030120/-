import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ThemeGenerationResponse } from "../types";

// Initialize Gemini Client
// Note: API Key is expected to be in process.env.API_KEY per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const themeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    theme: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "A creative name for the theme" },
        backgroundColor: { type: Type.STRING, description: "Hex color for the main app background (e.g. outside the game board)" },
        boardColor: { type: Type.STRING, description: "Hex color for the game board background" },
        snakeColor: { type: Type.STRING, description: "Hex color for the snake body" },
        snakeHeadColor: { type: Type.STRING, description: "Hex color for the snake head (should trigger visual distinction)" },
        foodColor: { type: Type.STRING, description: "Hex color for the food item" },
        gridColor: { type: Type.STRING, description: "Hex color for the grid lines (should be subtle)" },
        textColor: { type: Type.STRING, description: "Hex color for text elements (high contrast with background)" },
        borderColor: { type: Type.STRING, description: "Hex color for UI borders" },
      },
      required: ["name", "backgroundColor", "boardColor", "snakeColor", "snakeHeadColor", "foodColor", "gridColor", "textColor", "borderColor"],
    },
    commentary: {
      type: Type.STRING,
      description: "A short, witty 1-sentence remark about this theme or luck in the game.",
    },
  },
  required: ["theme", "commentary"],
};

export const generateGameTheme = async (userPrompt: string): Promise<ThemeGenerationResponse | null> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Create a visually cohesive color palette/theme for a Snake game based on the concept: "${userPrompt}". 
    Ensure high contrast between the snake, food, and board. The colors must be valid Hex codes.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: themeSchema,
        systemInstruction: "You are a UI/UX expert designer specializing in game aesthetics.",
        temperature: 0.7,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ThemeGenerationResponse;
    }
    return null;
  } catch (error) {
    console.error("Failed to generate theme:", error);
    return null;
  }
};