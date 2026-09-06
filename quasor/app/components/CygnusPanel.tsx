"use client";

import { useEffect, useRef, useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

interface CygnusPanelProps {
  code: string;
  language: string;
  problem?: string;
  error?: string;
  testResults?: string;
  topic?: string;
  difficulty?: string;
  executionResult?: any;
}

interface Message {
  id: number;
  role: "user" | "cygnus";
  content: string;
  time: string;
  isStreaming: boolean;
}

export default function CygnusPanel({
  code,
  language,
  problem,
  error,
  testResults,
  topic,
  difficulty,
  executionResult,
}: CygnusPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "hint" | "debug" | "explain" | "optimize">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextMessageId = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createMessageId = () => {
    nextMessageId.current += 1;
    return nextMessageId.current;
  };

  const streamCygnusMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: createMessageId(),
        role: "cygnus",
        content: text,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        isStreaming: false,
      },
    ]);
  };

  const sendMessage = async (userMessage: string, action?: string) => {
    if (!userMessage.trim() || loading) return;

    setLoading(true);
    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        id: createMessageId(),
        role: "user",
        content: userMessage,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        isStreaming: false,
      },
    ]);

    try {
      const response = await fetch("/api/cygnus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          code,
          language,
          problem,
          error,
          testResults,
          topic,
          difficulty,
          action,
          executionResult,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to get Cygnus response");
      }

      const answer = data.answer || "";
      if (answer.trim()) {
        await streamCygnusMessage(answer);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: "cygnus",
          content: `Error: ${errorMsg}`,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          isStreaming: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: "💡", label: "Hint", action: "hint" },
    { icon: "🐛", label: "Debug", action: "debug" },
    { icon: "📖", label: "Explain", action: "explain" },
    { icon: "⚡", label: "Optimize", action: "optimize" },
    { icon: "🧠", label: "Analyze", action: "analyze" },
  ];

  return (
    <div className="cygnus-panel">
      {/* Header */}
      <div className="cygnus-header">
        <div className="cygnus-title">
          <span className="cygnus-icon">✦</span>
          <div>
            <div className="cygnus-name">CYGNUS</div>
            <div className="cygnus-subtitle">Coding Intelligence</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="cygnus-actions">
        {quickActions.map((action) => (
          <button
            key={action.action}
            className="cygnus-action-btn"
            onClick={() => sendMessage(`${action.label.toLowerCase()}`, action.action)}
            disabled={loading || !code.trim()}
            title={action.label}
          >
            {action.icon}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="cygnus-messages">
        {messages.length === 0 ? (
          <div className="cygnus-empty">
            <p>Ask Cygnus about your code</p>
            <p style={{ fontSize: 12, color: "#a0a0a0", marginTop: 8 }}>
              Use quick actions above or type a question below
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`cygnus-message ${msg.role}`}>
              <div className="message-meta">
                <strong>{msg.role === "user" ? "You" : "Cygnus"}</strong>
                <span>{msg.time}</span>
              </div>
              <div className="message-body">
                {msg.role === "user" ? (
                  <p>{msg.content}</p>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}
                {msg.isStreaming && <span className="typing-cursor" />}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="cygnus-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          placeholder="Ask Cygnus about your code..."
          disabled={loading}
        />
        <button
          className="cygnus-send"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
        >
          {loading ? "..." : "↑"}
        </button>
      </div>
    </div>
  );
}
