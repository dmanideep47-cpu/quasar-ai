"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import MarkdownRenderer from "../components/MarkdownRenderer";

type Message = {
  id: number;
  role: "user" | "lyra";
  content: string;
  time: string;
  isStreaming?: boolean;
  imageUrl?: string;
};

type LyraState = "idle" | "thinking" | "searching" | "answering";

const suggestions = [
  "Explain a concept simply",
  "Solve this problem step by step",
  "Explain quantum physics simply",
  "Write and explain code",
];

function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WorkspacePage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [lyraState, setLyraState] = useState<LyraState>("idle");
  const [isSending, setIsSending] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const nextMessageId = useRef(0);
  const STREAM_DELAY_MS = 26;

  const createMessageId = () => {
    nextMessageId.current += 1;
    return nextMessageId.current;
  };

  function streamLyraMessage(text: string) {
    return new Promise<void>((resolve) => {
      const messageId = createMessageId();
      const message: Message = {
        id: messageId,
        role: "lyra",
        content: "",
        time: getTime(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, message]);

      let index = 0;
      const timer = window.setInterval(() => {
        index += 1;
        const nextText = text.slice(0, index);

        setMessages((prev) =>
          prev.map((item) =>
            item.id === messageId ? { ...item, content: nextText } : item,
          ),
        );

        if (index >= text.length) {
          window.clearInterval(timer);
          setMessages((prev) =>
            prev.map((item) =>
              item.id === messageId ? { ...item, isStreaming: false } : item,
            ),
          );
          resolve();
        }
      }, STREAM_DELAY_MS);
    });
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, lyraState]);

  async function askLyra(question: string) {
    const cleanQuestion = question.trim();

    if (!cleanQuestion || isSending) return;

    const userMessage: Message = {
      id: createMessageId(),
      role: "user",
      content: cleanQuestion,
      time: getTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    setLyraState("thinking");

    await new Promise((resolve) => setTimeout(resolve, 650));

    setLyraState("searching");

    await new Promise((resolve) => setTimeout(resolve, 850));

    try {
      const imageRequest = /\b(create|generate|draw|make|show|illustrate|design|visualize)\b[\s\S]*\b(image|picture|illustration|diagram|poster|chart|visual)\b/i.test(cleanQuestion)
        || /\b(can you|please|i want|i need)\b[\s\S]*\b(image|picture|illustration|diagram|poster|chart|visual)\b/i.test(cleanQuestion);
      if (imageRequest) {
        const imageResponse = await fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: cleanQuestion }),
        });
        const imageData = await imageResponse.json();
        if (!imageResponse.ok) throw new Error(imageData?.error || "Unable to create the image.");
        setLyraState("answering");
        setMessages((prev) => [...prev, {
          id: createMessageId(),
          role: "lyra",
          content: imageData.answer || "Here is your generated image.",
          time: getTime(),
          imageUrl: imageData.imageUrl,
        }]);
        return;
      }

      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: attachedFile
            ? `${cleanQuestion}\n\nAttached file: ${attachedFile.name}`
            : cleanQuestion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to get an answer.");
      }

      setLyraState("answering");

      await new Promise((resolve) => setTimeout(resolve, 500));

      const answerText = data?.answer || "";

      if (!answerText.trim()) {
        await streamLyraMessage("I couldn't generate a useful answer for that.");
      } else {
        await streamLyraMessage(answerText);
      }
    } catch (error) {
      console.error(error);

      await streamLyraMessage(
        "I couldn't reach the answer service right now. Check your API connection and try again.",
      );
    } finally {
      setLyraState("idle");
      setIsSending(false);
      setAttachedFile(null);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    askLyra(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askLyra(input);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      setAttachedFile(file);
    }
  }

  const stateText = {
    idle: "Ready when you are",
    thinking: "Thinking through your question",
    searching: "Finding the relevant information",
    answering: "Building your answer",
  }[lyraState];

  return (
    <main className="workspace-page">
      {/* Ambient background */}
      <div className="workspace-orb orb-one" />
      <div className="workspace-orb orb-two" />
      <div className="workspace-grid" />

      {/* TOP BAR */}
      <header className="workspace-header">
        <Link href="/?intro=1" className="workspace-brand">
          <span className="workspace-brand-mark">
            <span />
            <span />
            <span />
          </span>

          <span className="workspace-brand-name">QUASAR</span>
        </Link>

        <div className="workspace-title">
          <span className="workspace-title-dot" />
          WORKSPACE
        </div>

        <div className="workspace-status">
          <span className="online-dot" />
          ONLINE
        </div>
      </header>

      {/* MAIN */}
      <section className="workspace-main">
        {/* Intro only before conversation */}
        {messages.length === 0 && (
          <div className="workspace-intro">
            <div className="lyra-presence">
              <div
                className={`lyra-core lyra-${lyraState}`}
              >
                <div className="lyra-ring ring-one" />
                <div className="lyra-ring ring-two" />
                <div className="lyra-center">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>

            <div className="lyra-label">
              <span>LYRA</span>
              <i />
              <small>YOUR QUASAR ASSISTANT</small>
            </div>

            <h1>
              What are you
              <br />
              <span>curious about?</span>
            </h1>

            <p>
              Learn, solve, create and understand.
              <br />
              One conversation at a time.
            </p>
          </div>
        )}

        {/* CHAT */}
        {messages.length > 0 && (
          <div className="workspace-chat">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`chat-row ${
                  message.role === "user"
                    ? "chat-user"
                    : "chat-lyra"
                }`}
              >
                {message.role === "lyra" && (
                  <div className="message-avatar">
                    <div className="mini-lyra">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}

                <div className="message-column">
                  <div className="message-meta">
                    <strong>
                      {message.role === "user" ? "YOU" : "LYRA"}
                    </strong>
                    <span>{message.time}</span>
                  </div>

                  <div className="message-content">
                    {message.role === "lyra" ? (
                      <>
                        <MarkdownRenderer content={message.content} />
                        {message.imageUrl && (
                          <img
                            className="generated-image"
                            src={message.imageUrl}
                            alt="Generated educational visual"
                          />
                        )}
                        {message.isStreaming && (
                          <span className="stream-cursor" aria-hidden="true" />
                        )}
                      </>
                    ) : (
                      message.content.split("\n").map((line, index) => (
                        <span key={index}>
                          {line}
                          {index < message.content.split("\n").length - 1 && (
                            <br />
                          )}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </article>
            ))}

            {/* THINKING / SEARCHING STATE */}
            {isSending && (
              <article className="chat-row chat-lyra live-row">
                <div className="message-avatar">
                  <div className={`mini-lyra lyra-${lyraState}`}>
                    <span />
                    <span />
                    <span />
                  </div>
                </div>

                <div className="message-column">
                  <div className="message-meta">
                    <strong>LYRA</strong>
                    <span>NOW</span>
                  </div>

                  <div className="live-thinking">
                    <div className="thinking-icon">
                      <span />
                      <span />
                      <span />
                    </div>

                    <span>{stateText}</span>
                  </div>
                </div>
              </article>
            )}

            <div ref={chatEndRef} />
          </div>
        )}

        {/* SUGGESTIONS */}
        {messages.length === 0 && (
          <div className="workspace-suggestions">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => askLyra(suggestion)}
              >
                <span>{suggestion}</span>
                <b>↗</b>
              </button>
            ))}
          </div>
        )}

        {/* COMPOSER */}
        <div className="workspace-composer-area">
          {attachedFile && (
            <div className="attached-preview">
              <div className="attached-icon">↗</div>

              <div>
                <strong>{attachedFile.name}</strong>
                <span>
                  {(attachedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>

              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                aria-label="Remove attachment"
              >
                ×
              </button>
            </div>
          )}

          <form
            className={`workspace-composer ${
              isSending ? "composer-busy" : ""
            }`}
            onSubmit={handleSubmit}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Lyra anything..."
              rows={1}
              disabled={isSending}
            />

            <div className="composer-bottom">
              <div className="composer-tools">
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                />

                <button
                  type="button"
                  className="composer-tool"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach file"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path d="M21.4 11.6 12 21a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7L9 18.4a2 2 0 0 1-2.8-2.8l8.6-8.6" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="composer-tool"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.capture = "environment";

                    input.onchange = () => {
                      const file = input.files?.[0];
                      if (file) setAttachedFile(file);
                    };

                    input.click();
                  }}
                  aria-label="Use camera"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path d="M4 7h3l1.5-2h7L17 7h3v11H4V7Z" />
                    <circle cx="12" cy="12.5" r="3.2" />
                  </svg>
                </button>

                <span className="composer-hint">
                  Enter to send · Shift + Enter for new line
                </span>
              </div>

              <button
                type="submit"
                className="send-button"
                disabled={!input.trim() || isSending}
                aria-label="Send message"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M21 3 10 14" />
                  <path d="m21 3-7 18-4-7-7-4 18-7Z" />
                </svg>
              </button>
            </div>
          </form>

          <div className="composer-footer">
            <span>QUASAR WORKSPACE</span>
            <span>LYRA • AI STUDY ASSISTANT</span>
          </div>
        </div>
      </section>
    </main>
  );
}