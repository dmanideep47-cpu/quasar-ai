import MarkdownRenderer from "./MarkdownRenderer";

type EquationBlockProps = {
  equations?: string[];
};

export default function EquationBlock({ equations }: EquationBlockProps) {
  if (!equations || !equations.length) return null;

  return (
    <div className="equation-block">
      {equations.map((equation, index) => (
        <div key={`${equation}-${index}`} className="equation-line">
          <MarkdownRenderer content={equation} />
        </div>
      ))}
    </div>
  );
}
