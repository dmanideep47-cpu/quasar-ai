import type { ResponseData } from "../types/quasar";
import DiagramPanel from "./DiagramPanel";
import FinalAnswer from "./FinalAnswer";
import GivenPanel from "./GivenPanel";
import GraphPanel from "./GraphPanel";
import QuestionCard from "./QuestionCard";
import SolutionSteps from "./SolutionSteps";
import VerificationPanel from "./VerificationPanel";
import MarkdownRenderer from "./MarkdownRenderer";

type QuasarResponseProps = {
  response: ResponseData;
};

export default function QuasarResponse({ response }: QuasarResponseProps) {
  const sideItems: Array<{ title: string; items: Array<{ label: string; value: string }> }> = [];

  if (response.given?.length) {
    sideItems.push({ title: "GIVEN", items: response.given });
  }

  if (response.find?.length) {
    sideItems.push({
      title: "FIND",
      items: response.find.map((item) => ({ label: "", value: item })),
    });
  }

  if (response.keyValues?.length) {
    sideItems.push({ title: "KEY VALUES", items: response.keyValues });
  }

  const visualPanels = [] as JSX.Element[];

  if (response.graph?.enabled) {
    visualPanels.push(<GraphPanel key="graph" graph={response.graph} />);
  }

  if (response.diagram?.nodes?.length) {
    visualPanels.push(<DiagramPanel key="diagram" diagram={response.diagram} />);
  }

  return (
    <section className="response-workspace">
      <div className="response-main">
        {/* Question */}
        <QuestionCard question={response.question} />

        {/* Quick Summary - Overview */}
        {response.summary && (
          <section className="panel summary-panel">
            <div className="panel-header">📌 QUICK SUMMARY</div>
            <div className="panel-body subtle-copy">
              <MarkdownRenderer content={response.summary} />
            </div>
          </section>
        )}

        {/* Concept - What is it */}
        {response.concept && (
          <section className="panel">
            <div className="panel-header">💡 CORE CONCEPT</div>
            <div className="panel-body subtle-copy">
              <MarkdownRenderer content={response.concept} />
            </div>
          </section>
        )}

        {visualPanels.length > 0 && <div className="visual-flow">{visualPanels}</div>}

        {/* Detailed Explanation */}
        {response.explanation && (
          <section className="panel">
            <div className="panel-header">📖 DETAILED EXPLANATION</div>
            <div className="panel-body subtle-copy">
              <MarkdownRenderer content={response.explanation} />
            </div>
          </section>
        )}

        {/* Solution Steps - How to do it */}
        {response.steps && response.steps.length > 0 && (
          <SolutionSteps steps={response.steps} />
        )}

        {/* Code Examples */}
        {response.code && (
          <section className="panel">
            <div className="panel-header">💻 CODE EXAMPLE</div>
            <div className="panel-body">
              <pre className="code-pre">
                <code>{response.code}</code>
              </pre>
            </div>
          </section>
        )}

        {/* Verification - Correctness Check */}
        {response.verification && response.verification.length > 0 && (
          <VerificationPanel items={response.verification} />
        )}

        {/* Final Answer - Conclusion */}
        <FinalAnswer answer={response.finalAnswer} />
      </div>

      {/* Side Information Panel */}
      <aside className="response-side">
        {/* Supporting Information */}
        {sideItems.map((panel) => (
          <GivenPanel key={panel.title} title={panel.title} items={panel.items} />
        ))}
      </aside>
    </section>
  );
}
