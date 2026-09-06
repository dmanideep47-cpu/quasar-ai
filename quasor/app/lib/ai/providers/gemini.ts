import { getAIConfig, modelForTask } from "../config";
import { AIProviderError, isTransientStatus } from "../errors";
import { advanceGeminiKey, getGeminiKeyOrder } from "./gemini-key-pool";
import { retryTransient } from "../retry";
import type { AIContentPart, GenerateAIRequest } from "../types";

function toGeminiParts(content: string | AIContentPart[]) {
  if (typeof content === "string") return [{ text: content }];

  return content.map((part) => {
    if (part.type === "text") return { text: part.text };
    if (part.type === "image_url") {
      const [, encoded] = part.image_url.url.split(",", 2);
      const mimeType = part.image_url.url.match(/^data:([^;]+);/)?.[1] || "image/*";
      return { inline_data: { mime_type: mimeType, data: encoded || part.image_url.url } };
    }
    return { inline_data: { mime_type: part.mimeType, data: part.data } };
  });
}

export async function generateWithGemini(request: GenerateAIRequest) {
  const model = request.model || modelForTask("gemini", request.task || "general");
  if (!model) throw new AIProviderError("Gemini is not configured.", 503, false);
  const keys = getGeminiKeyOrder();
  if (!keys.length) throw new AIProviderError("Gemini is not configured.", 503, false);

  let lastError: AIProviderError | undefined;
  for (const key of keys) {
    try {
      const contents = request.messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: toGeminiParts(message.content),
      }));
      const result = await retryTransient(async () => {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: "POST",
            signal: request.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: request.systemPrompt
                ? { parts: [{ text: request.systemPrompt }] }
                : undefined,
              contents,
              generationConfig: {
                temperature: request.temperature,
                maxOutputTokens: request.maxTokens,
                responseMimeType: "text/plain",
              },
            }),
          },
        );
        if (!response.ok) {
          throw new AIProviderError("Gemini request failed.", response.status, isTransientStatus(response.status));
        }
        const data = await response.json();
        const answer = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim();
        if (!answer) throw new AIProviderError("Gemini returned an empty response.", 502, true);
        return {
          answer,
          model,
          finishReason: data?.candidates?.[0]?.finishReason,
        };
      });
      return result;
    } catch (error) {
      const normalized = error instanceof AIProviderError
        ? error
        : new AIProviderError("Gemini request failed.", undefined, true);
      if (!normalized.transient) throw normalized;
      lastError = normalized;
      advanceGeminiKey();
    }
  }
  throw lastError || new AIProviderError("Gemini is unavailable.", 503, true);
}
