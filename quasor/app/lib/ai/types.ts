export type AIProvider = "openai" | "gemini" | "auto";
export type AITask = "general" | "academic" | "reasoning" | "coding" | "fast";

export type AIContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "file"; mimeType: string; data: string };

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string | AIContentPart[];
};

export type GenerateAIRequest = {
  provider?: AIProvider;
  task?: AITask;
  model?: string;
  systemPrompt?: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
};

export type AIResponse = {
  answer: string;
  provider: Exclude<AIProvider, "auto">;
  model: string;
  usedFallback: boolean;
  finishReason?: string;
};
