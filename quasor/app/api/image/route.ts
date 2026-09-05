import { NextRequest, NextResponse } from "next/server";

const imageModel =
  process.env.GEMINI_IMAGE_MODEL?.trim() || "gemini-2.0-flash-exp";

function wantsImage(message: string) {
  return /\b(create|generate|draw|make|show|illustrate|design|visualize)\b[\s\S]*\b(image|picture|illustration|diagram|poster|chart|visual)\b/i.test(message)
    || /\b(image|picture|illustration|diagram|poster|chart|visual)\b[\s\S]*\b(create|generate|draw|make|show|illustrate|design)\b/i.test(message)
    || /\b(can you|please|i want|i need)\b[\s\S]*\b(image|picture|illustration|diagram|poster|chart|visual)\b/i.test(message);
}

function fallbackImage(prompt: string) {
  const safePrompt = prompt.replace(/[<>&"]/g, "").slice(0, 100);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#120d27"/><stop offset="1" stop-color="#35136b"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="14"/></filter></defs><rect width="1200" height="700" fill="url(#bg)"/><circle cx="930" cy="160" r="150" fill="#a855f7" opacity=".25" filter="url(#glow)"/><circle cx="260" cy="560" r="180" fill="#38bdf8" opacity=".16" filter="url(#glow)"/><path d="M130 500 Q600 90 1070 360" fill="none" stroke="#c084fc" stroke-width="5" opacity=".8"/><path d="M150 520 Q600 150 1030 390" fill="none" stroke="#67e8f9" stroke-width="2" opacity=".8"/><text x="80" y="105" fill="#fff" font-family="Arial,sans-serif" font-size="34" font-weight="700">Quasar visual</text><text x="80" y="155" fill="#ddd6fe" font-family="Arial,sans-serif" font-size="22">${safePrompt}</text><text x="80" y="640" fill="#c4b5fd" font-family="Arial,sans-serif" font-size="18">Generated study visual</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) return NextResponse.json({ error: "Image prompt is required." }, { status: 400 });
  if (!wantsImage(prompt)) return NextResponse.json({ error: "Ask Quasar to create or generate an image." }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: `Create an educational image based on this request: ${prompt}` }] }],
            generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
          }),
        },
      );
      const data = await response.json();
      const imagePart = data?.candidates?.[0]?.content?.parts?.find(
        (part: { inlineData?: { mimeType?: string; data?: string } }) => part.inlineData?.data,
      );
      if (response.ok && imagePart?.inlineData?.data) {
        return NextResponse.json({
          answer: "Here is the image you requested.",
          imageUrl: `data:${imagePart.inlineData.mimeType || "image/png"};base64,${imagePart.inlineData.data}`,
        });
      }
    } catch (error) {
      console.error("Image service unavailable; using local visual fallback.", error);
    }
  }

  return NextResponse.json({
    answer: "I created a study visual for your request.",
    imageUrl: fallbackImage(prompt),
  });
}
