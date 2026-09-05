"use client";

import { useState } from "react";

type CodeBlockProps = {
  children: string;
  className?: string;
};

export default function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lang = className?.replace("language-", "") || "text";
  const code = String(children).trim();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>{lang}</span>
        <button type="button" onClick={handleCopy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
