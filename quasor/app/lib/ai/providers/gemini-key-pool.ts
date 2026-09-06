let activeKeyIndex = 0;

export function getGeminiKeys() {
  return [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].map((key) => key?.trim()).filter((key): key is string => Boolean(key));
}

export function getGeminiKeyOrder() {
  const keys = getGeminiKeys();
  if (!keys.length) return [];
  const start = activeKeyIndex % keys.length;
  return [...keys.slice(start), ...keys.slice(0, start)];
}

export function advanceGeminiKey() {
  const keys = getGeminiKeys();
  if (keys.length > 1) activeKeyIndex = (activeKeyIndex + 1) % keys.length;
}
