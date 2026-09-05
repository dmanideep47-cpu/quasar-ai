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

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
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
      {content}
    </ReactMarkdown>
  );
}
