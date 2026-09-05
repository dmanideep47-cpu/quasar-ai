import type { StepData } from "../types/quasar";
import EquationBlock from "./EquationBlock";
import MarkdownRenderer from "./MarkdownRenderer";

type SolutionStepsProps = {
  steps: StepData[];
};

export default function SolutionSteps({ steps }: SolutionStepsProps) {
  if (!steps.length) return null;

  return (
    <section className="panel solution-panel">
      <div className="panel-header">FLOW</div>
      <div className="solution-steps">
        {steps.map((step, index) => (
          <div key={step.number} className="solution-step" data-step={step.number}>
            <div className="step-header">
              <span className="step-number">{step.number}</span>
              <div className="step-header-content">
                <h3>{step.title}</h3>
                {index < steps.length - 1 && <div className="step-connector" />}
              </div>
            </div>

            <div className="step-body">
              <MarkdownRenderer content={step.explanation} />
            </div>

            {step.equations && step.equations.length > 0 && (
              <EquationBlock equations={step.equations} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
