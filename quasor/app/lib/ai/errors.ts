export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly status: number | undefined,
    public readonly transient: boolean,
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

export function normalizeProviderError(error: unknown) {
  if (error instanceof AIProviderError) return error;
  return new AIProviderError(
    "AI provider request failed.",
    undefined,
    error instanceof TypeError,
  );
}

export function isTransientStatus(status: number) {
  return [408, 429, 500, 502, 503, 504].includes(status);
}
