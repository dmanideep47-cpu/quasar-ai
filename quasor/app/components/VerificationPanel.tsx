import type { VerificationItem } from "../types/quasar";

type VerificationPanelProps = {
  items?: VerificationItem[];
};

export default function VerificationPanel({ items }: VerificationPanelProps) {
  if (!items || !items.length) return null;

  return (
    <section className="panel">
      <div className="panel-header">VERIFICATION</div>
      <div className="verification-list">
        {items.map((item) => (
          <div key={item.label} className={`verification-row ${item.ok ? "ok" : "fail"}`}>
            <span className="verification-symbol">{item.ok ? "✓" : "✕"}</span>
            <div>
              <strong>{item.label}</strong>
              {item.detail && <small>{item.detail}</small>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
