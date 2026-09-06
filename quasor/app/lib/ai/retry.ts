import { AIProviderError } from "./errors";

const MAX_ATTEMPTS = 2;
const BASE_DELAY_MS = 250;

export async function retryTransient<T>(operation: () => Promise<T>) {
  let lastError: AIProviderError | undefined;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof AIProviderError
        ? error
        : new AIProviderError("AI provider request failed.", undefined, true);
      if (!lastError.transient || attempt === MAX_ATTEMPTS - 1) throw lastError;
      await new Promise((resolve) => setTimeout(resolve, BASE_DELAY_MS * 2 ** attempt));
    }
  }

  throw lastError || new AIProviderError("AI provider request failed.", undefined, false);
}
