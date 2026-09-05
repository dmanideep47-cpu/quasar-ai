"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  readOnly?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  language,
  height = "400px",
  readOnly = false,
}: CodeEditorProps) {
  return (
    <div className="code-editor" style={{ height }}>
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        theme="vs-dark"
        options={{
          readOnly,
          automaticLayout: true,
          fontSize: 13,
          lineHeight: 18,
          minimap: { enabled: true, scale: 1 },
          folding: true,
          foldingHighlight: true,
          guides: { indentation: true, bracketPairs: true },
          bracketPairColorization: { enabled: true },
          matchBrackets: "always",
          occurrencesHighlight: "singleFile",
          cursorBlinking: "smooth",
          smoothScrolling: true,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          fontLigatures: true,
          padding: { top: 8, bottom: 8 },
          tabSize: 4,
          wordWrap: "off",
        }}
      />
    </div>
  );
}
