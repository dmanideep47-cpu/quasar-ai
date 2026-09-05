import type { ResponseData } from "../types/quasar";
import MarkdownRenderer from "./MarkdownRenderer";

type QuestionCardProps = {
  question: ResponseData["question"];
};

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <section className="panel question-panel">
      <div className="panel-header">❓ YOUR QUESTION</div>
      <div className="panel-body subtle-copy question-content">
        <MarkdownRenderer content={question} />
      </div>
    </section>
  );
}
