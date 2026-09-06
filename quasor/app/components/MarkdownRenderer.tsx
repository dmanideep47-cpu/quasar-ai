"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import CodeBlock from "./CodeBlock";

type MarkdownRendererProps = {
  content: string;
};

function repairCharacterSpacing(text: string) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
  const brokenLines = nonEmptyLines.filter((line) => line.trim().length <= 2);
  const spacedCharacterLines = nonEmptyLines.filter((line) =>
    /^(?:\S\s+){8,}\S$/.test(line.trim()),
  );

  // Some provider responses arrive with one character per line. Only join
  // when the whole response strongly matches that corruption pattern so
  // legitimate Markdown paragraph breaks remain untouched.
  if (
    nonEmptyLines.length >= 8 &&
    brokenLines.length / nonEmptyLines.length >= 0.7
  ) {
    return nonEmptyLines.map((line) => line.trim()).join("");
  }

  if (
    spacedCharacterLines.length > 0 &&
    spacedCharacterLines.length / nonEmptyLines.length >= 0.6
  ) {
    return lines
      .map((line) =>
        /^(?:\S\s+){8,}\S$/.test(line.trim())
          ? line.replace(/\s+/g, "")
          : line,
      )
      .join("\n");
  }

  return lines.join("\n");
}

function prepareMarkdown(content: string) {
  const normalized = repairCharacterSpacing(content)
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$");

  // Do not wrap arbitrary prose in math or repair delimiters per line. Math
  // expressions can span multiple lines; line-by-line fixes corrupt them.
  const displayDelimiterCount = (normalized.match(/\$\$/g) || []).length;
  if (displayDelimiterCount % 2 !== 0) return `${normalized}\n$$`;

  return normalized;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const markdown = prepareMarkdown(content);

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex] as any]}
        components={{
          code({ className, children, ...props }) {
            const value = String(children).replace(/\n$/, "");
            const isInline = !className;

            if (isInline) {
              return <code className="inline-code" {...props}>{value}</code>;
            }

            return <CodeBlock className={className}>{value}</CodeBlock>;
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
