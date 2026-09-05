import MarkdownRenderer from "./MarkdownRenderer";

type FinalAnswerProps = {
  answer?: string;
};

export default function FinalAnswer({ answer }: FinalAnswerProps) {
  if (!answer) return null;

  return (
    <section className="final-answer-card">
      <div className="panel-header">
        <span className="final-answer-badge">✨</span>
        COMPREHENSIVE ANSWER
      </div>
      <div className="final-answer-body">
        <MarkdownRenderer content={answer} />
      </div>
      <div className="final-answer-footer">
        ✓ Complete explanation • ✓ All aspects covered • ✓ Ready to use
      </div>
    </section>
  );
}
