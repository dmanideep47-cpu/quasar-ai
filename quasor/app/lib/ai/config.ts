import type { AIProvider, AITask } from "./types";

export const OPENAI_MODEL = "gpt-6";
export const GEMINI_MODEL = "gemini-3.5-flash";

export function getAIConfig() {
  return {
    primary: providerFromEnv(process.env.AI_PRIMARY_PROVIDER, "openai"),
    fallback: providerFromEnv(process.env.AI_FALLBACK_PROVIDER, "gemini"),
    openAIKey: process.env.OPENAI_API_KEY?.trim() || "",
  };
}

function providerFromEnv(value: string | undefined, fallback: Exclude<AIProvider, "auto">) {
  return value === "gemini" || value === "openai" ? value : fallback;
}

export function modelForTask(provider: Exclude<AIProvider, "auto">, task: AITask) {
  const config = getAIConfig();
  return provider === "openai" ? OPENAI_MODEL : GEMINI_MODEL;
}
