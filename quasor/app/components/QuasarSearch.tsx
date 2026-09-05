"use client";

import { useEffect, useRef, useState } from "react";
import QuasarResponse from "./QuasarResponse";
import MarkdownRenderer from "./MarkdownRenderer";
import type { ResponseData } from "../types/quasar";

const quickPrompts = [
  "Explain a concept simply",
  "Solve this problem step by step",
  "Explain quantum physics in simple words",
  "Write and explain the code",
];

function isStructuredResponse(value: unknown): value is Record<string, unknown> {
  // Accept any object that looks like the structured ResponseData rather than
  // requiring both `type` and `question` strictly. Backends may omit `type`
  // or `question` on the wire; prefer to coerce useful structured fields.
  if (!value || typeof value !== "object") return false;
  const keys = Object.keys(value as Record<string, unknown>);
  const structuredKeys = [
    "summary",
    "steps",
    "given",
    "find",
    "keyValues",
    "graph",
    "verification",
    "finalAnswer",
    "concept",
    "explanation",
    "code",
    "diagram",
    "question",
    "type",
  ];

  return keys.some((k) => structuredKeys.includes(k));
}

type Props = { showHero?: boolean; onFocus?: () => void };

export default function QuasarSearch({ showHero = true, onFocus }: Props) {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [plainAnswer, setPlainAnswer] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [asked, setAsked] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current !== null) {
        window.clearInterval(typingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [message]);

  async function askQuasar() {
    const nextQuestion = message.trim();
    if (!nextQuestion || loading) return;

    setAsked(true);
    setLoading(true);
    setError("");
    setResponse(null);
    setPlainAnswer("");
    setImageUrl("");
    if (typingTimerRef.current !== null) {
      window.clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    try {
      const imageRequest = /\b(create|generate|draw|make|show|illustrate|design|visualize)\b[\s\S]*\b(image|picture|illustration|diagram|poster|chart|visual)\b/i.test(nextQuestion)
        || /\b(can you|please|i want|i need)\b[\s\S]*\b(image|picture|illustration|diagram|poster|chart|visual)\b/i.test(nextQuestion);
      if (imageRequest) {
        const imageResponse = await fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: nextQuestion }),
        });
        const imageData = await imageResponse.json();
        if (!imageResponse.ok) throw new Error(imageData?.error || "Unable to create the image.");
        setImageUrl(imageData.imageUrl || "");
        setPlainAnswer(imageData.answer || "Here is the image you requested.");
        return;
      }

      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: nextQuestion }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to generate the solution.");
      }

      const payload = data.answer ?? data.response ?? null;

      // If the backend returned a string, keep it simple. If it returned an
      // object that looks like a structured response, coerce it into the
      // ResponseData shape so QuasarResponse can render it.
      if (typeof payload === "string" && payload.trim()) {
        const baseResponse: ResponseData = {
          type: "general",
          question: nextQuestion,
          summary: "",
          finalAnswer: "",
        };
        setResponse(baseResponse);
        setPlainAnswer("");

        let visibleCharacters = 0;
        typingTimerRef.current = window.setInterval(() => {
          visibleCharacters += 3;
          const visibleText = payload.slice(0, visibleCharacters);
          setPlainAnswer(visibleText);
          setResponse({
            ...baseResponse,
            summary: visibleText,
            finalAnswer: visibleText,
          });

          if (visibleCharacters >= payload.length && typingTimerRef.current !== null) {
            window.clearInterval(typingTimerRef.current);
            typingTimerRef.current = null;
          }
        }, 12);
      } else if (payload && typeof payload === "object" && isStructuredResponse(payload)) {
        const p = payload as Record<string, unknown>;
        const normalizedType =
          typeof p.type === "string" &&
            ["mathematics", "physics", "chemistry", "programming", "general"].includes(
              p.type,
            )
            ? (p.type as ResponseData["type"])
            : "general";

        setResponse({
          type: normalizedType,
          question: typeof p.question === "string" ? p.question : nextQuestion,
          summary: typeof p.summary === "string" ? p.summary : undefined,
          steps: Array.isArray(p.steps) ? (p.steps as ResponseData["steps"]) : undefined,
          given: Array.isArray(p.given) ? (p.given as ResponseData["given"]) : undefined,
          find: Array.isArray(p.find) ? (p.find as ResponseData["find"]) : undefined,
          keyValues: Array.isArray(p.keyValues)
            ? (p.keyValues as ResponseData["keyValues"])
            : undefined,
          graph:
            p.graph && typeof p.graph === "object"
              ? (p.graph as ResponseData["graph"])
              : undefined,
          verification: Array.isArray(p.verification)
            ? (p.verification as ResponseData["verification"])
            : undefined,
          finalAnswer:
            typeof p.finalAnswer === "string"
              ? p.finalAnswer
              : typeof p.summary === "string"
                ? p.summary
                : undefined,
          concept: typeof p.concept === "string" ? p.concept : undefined,
          explanation: typeof p.explanation === "string" ? p.explanation : undefined,
          code: typeof p.code === "string" ? p.code : undefined,
          codeLanguage: typeof p.codeLanguage === "string" ? p.codeLanguage : undefined,
          diagram:
            p.diagram && typeof p.diagram === "object"
              ? (p.diagram as ResponseData["diagram"])
              : undefined,
        });
      } else {
        setResponse({
          type: "general",
          question: nextQuestion,
          summary: "Quasar produced a response, but it could not be rendered in the structured workspace.",
          finalAnswer: "Response received.",
        });
      }
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to generate the solution."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askQuasar();
    }
  }

  return (
    <section className={`quasar-search-shell${asked ? " has-answer" : ""}`}>
      {showHero && !asked && (
        <header className="quasar-hero">
          <div className="hero-logo" aria-hidden="true">
            <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
              <circle className="static-orbit" cx="120" cy="120" r="82" />
              <path className="static-beam" d="M55 185 L185 55" />
              <circle className="static-core" cx="120" cy="120" r="12" />
            </svg>
          </div>

          <h1>Think beyond.</h1>
          <p>Learn, solve, create and understand with Quasar.</p>
        </header>
      )}

      <div className="search-wrap">
        <form
          className="search-container"
          onSubmit={(event) => {
            event.preventDefault();
            void askQuasar();
          }}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            placeholder="Ask Quasar anything..."
            rows={1}
            disabled={loading}
          />

          <div className="search-actions">
            <button type="button" className="icon-button" aria-label="Open camera">
              📷
            </button>
            <button type="button" className="icon-button" aria-label="Attach file">
              📎
            </button>
            <button
              type="submit"
              className="send-button"
              disabled={!message.trim() || loading}
              aria-label="Send prompt"
            >
              {loading ? <span className="send-loader" /> : "↑"}
            </button>
          </div>
          </form>
      </div>

      {!asked && (
        <div className="quick-actions">
          {quickPrompts.map((prompt) => (
            <button key={prompt} type="button" onClick={() => setMessage(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="thinking-card">
          <div className="thinking-icon">
            <span />
            <span />
            <span />
          </div>
          <div className="thinking-copy">
            <strong>Quasar is thinking</strong>
            <p>Analyzing your question</p>
          </div>
        </div>
      )}

      {error && (
        <div className="error-card">
          <div className="panel-header">QUASAR</div>
          <div className="panel-body">
            <p className="error-title">Unable to generate the solution.</p>
            <p>Reason: {error}</p>
          </div>
        </div>
      )}

      {plainAnswer ? (
        <section className="home-chat">
          <div className="home-chat__question">
            <span className="home-chat__label">YOU</span>
            <p>{response?.question}</p>
          </div>
          <div className="home-chat__answer">
            <div className="home-chat__label">QUASAR</div>
            <MarkdownRenderer content={plainAnswer} />
            {imageUrl && <img className="generated-image" src={imageUrl} alt="Generated educational visual" />}
          </div>
        </section>
      ) : (
        response && <QuasarResponse response={response} />
      )}
    </section>
  );
}