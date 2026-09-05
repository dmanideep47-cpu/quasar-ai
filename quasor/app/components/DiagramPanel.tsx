import type { DiagramData } from "../types/quasar";

type DiagramPanelProps = {
  diagram?: DiagramData;
};

export default function DiagramPanel({ diagram }: DiagramPanelProps) {
  if (!diagram || !diagram.nodes?.length) return null;

  return (
    <section className="panel diagram-panel">
      <div className="panel-header">DIAGRAM</div>
      <div className="panel-body">
        <svg viewBox="0 0 300 200" className="diagram-svg" role="img" aria-label={diagram.title || "Diagram"}>
          <rect x="40" y="90" width="120" height="60" rx="12" className="diagram-object" />
          <line x1="160" y1="120" x2="220" y2="120" className="diagram-axis" />
          <line x1="95" y1="90" x2="95" y2="30" className="diagram-axis" />
          <line x1="95" y1="120" x2="140" y2="65" className="diagram-force" />
          <line x1="95" y1="120" x2="55" y2="150" className="diagram-force alt" />
          <text x="100" y="60" className="diagram-label">m</text>
          <text x="168" y="102" className="diagram-label">F</text>
          <text x="25" y="155" className="diagram-label">N</text>
        </svg>
        {diagram.description && <p className="diagram-caption">{diagram.description}</p>}
      </div>
    </section>
  );
}
