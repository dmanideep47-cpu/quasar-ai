import { AIProviderError } from "./errors";
import { getAIConfig } from "./config";
import { generateWithGemini } from "./providers/gemini";
import { generateWithOpenAI } from "./providers/openai";
import type { AIProvider, GenerateAIRequest } from "./types";

export async function generateAIResponse(request: GenerateAIRequest) {
  const config = getAIConfig();
  const selected = request.provider && request.provider !== "auto"
    ? request.provider
    : config.primary;
  const fallback = config.fallback === selected ? undefined : config.fallback;
  let firstError: AIProviderError | undefined;

  try {
    return {
      ...(await generateProvider(selected, request)),
      provider: selected,
      usedFallback: false,
    };
  } catch (error) {
    firstError = error instanceof AIProviderError ? error : new AIProviderError("AI request failed.", undefined, false);
    if (!fallback || !shouldUseFallback(firstError)) throw firstError;
  }

  try {
    return {
      ...(await generateProvider(fallback!, request)),
      provider: fallback!,
      usedFallback: true,
    };
  } catch {
    throw new AIProviderError(
      "Quasar couldn't reach its AI services right now. Please try again shortly.",
      firstError?.status,
      false,
    );
  }
}

function shouldUseFallback(error: AIProviderError) {
  // A provider outage, quota/auth issue, or network failure should not make
  // the whole Quasar search unavailable when the configured fallback works.
  // Malformed requests and unsupported models are application errors instead.
  return error.transient || ![400, 404, 422].includes(error.status || 0);
}

async function generateProvider(provider: Exclude<AIProvider, "auto">, request: GenerateAIRequest) {
  return provider === "openai" ? generateWithOpenAI(request) : generateWithGemini(request);
}
