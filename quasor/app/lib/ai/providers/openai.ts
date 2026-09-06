import { AIProviderError, isTransientStatus } from "../errors";
import { getAIConfig, modelForTask } from "../config";
import { retryTransient } from "../retry";
import type { AIContentPart, GenerateAIRequest } from "../types";

function toOpenAIContent(content: string | AIContentPart[]) {
  if (typeof content === "string") return content;

  return content.map((part) => {
    if (part.type === "text") return part;
    if (part.type === "image_url") return part;
    return {
      type: "file",
      file: {
        filename: "attachment",
        file_data: `data:${part.mimeType};base64,${part.data}`,
      },
    };
  });
}

export async function generateWithOpenAI(request: GenerateAIRequest) {
  const config = getAIConfig();
  const model = request.model || modelForTask("openai", request.task || "general");
  if (!config.openAIKey || !model) {
    throw new AIProviderError("OpenAI is not configured.", 503, false);
  }

  const messages = [
    ...(request.systemPrompt ? [{ role: "system" as const, content: request.systemPrompt }] : []),
    ...request.messages.map((message) => ({
      ...message,
      content: toOpenAIContent(message.content),
    })),
  ];
  return retryTransient(async () => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: request.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openAIKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
      }),
    });
    if (!response.ok) {
      throw new AIProviderError("OpenAI request failed.", response.status, isTransientStatus(response.status));
    }
    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new AIProviderError("OpenAI returned an empty response.", 502, true);
    return {
      answer,
      model,
      finishReason: data?.choices?.[0]?.finish_reason,
    };
  });
}
