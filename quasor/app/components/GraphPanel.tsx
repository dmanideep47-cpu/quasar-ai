import type { GraphData } from "../types/quasar";

type GraphPanelProps = {
  graph?: GraphData;
};

export default function GraphPanel({ graph }: GraphPanelProps) {
  if (!graph?.enabled) return null;

  const points = graph.data && graph.data.length > 1 ? graph.data : [[0, 0], [1, 1], [2, 0], [3, 2], [4, 1]];
  const width = 320;
  const height = 180;
  const padding = 24;

  const maxX = Math.max(...points.map(([x]) => x), 1);
  const minX = Math.min(...points.map(([x]) => x), 0);
  const maxY = Math.max(...points.map(([, y]) => y), 1);
  const minY = Math.min(...points.map(([, y]) => y), 0);

  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;

  const path = points
    .map(([x, y], index) => {
      const px = padding + ((x - minX) / xRange) * (width - padding * 2);
      const py = height - padding - ((y - minY) / yRange) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"}${px.toFixed(2)},${py.toFixed(2)}`;
    })
    .join(" ");

  return (
    <section className="panel graph-panel">
      <div className="panel-header">GRAPH</div>
      <div className="panel-body">
        <svg viewBox={`0 0 ${width} ${height}`} className="graph-svg" role="img" aria-label={graph.title || "Graph"}>
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="axis" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="axis" />
          <path d={path} className="graph-line" />
        </svg>
        {(graph.xLabel || graph.yLabel) && (
          <div className="graph-labels">
            {graph.xLabel && <span>{graph.xLabel}</span>}
            {graph.yLabel && <span>{graph.yLabel}</span>}
          </div>
        )}
      </div>
    </section>
  );
}
