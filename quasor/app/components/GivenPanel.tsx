type GivenPanelProps = {
  title: string;
  items: Array<{ label: string; value: string }>;
};

export default function GivenPanel({ title, items }: GivenPanelProps) {
  if (!items.length) return null;

  return (
    <section className="panel compact-panel">
      <div className="panel-header">{title}</div>
      <div className="key-list">
        {items.map((item) => (
          <div key={`${title}-${item.label}`} className="key-row">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
