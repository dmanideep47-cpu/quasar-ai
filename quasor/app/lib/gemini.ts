import { GoogleGenerativeAI } from "@google/generative-ai";

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash";

export function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from .env.local");
  }

  return new GoogleGenerativeAI(apiKey);
}
