import Link from "next/link";

export default function LibraryPage() {
  return (
    <main className="quasar-home" style={{ minHeight: "100vh", paddingBottom: 48 }}>
      <nav className="quasar-nav">
        <Link href="/?intro=1" className="nav-brand">
          <span className="brand-symbol">✦</span>
          <span>QUASAR</span>
        </Link>

        <div className="nav-links">
          <Link href="/workspace">WORKSPACE</Link>
          <Link href="/code-lab">CODE LAB</Link>
          <Link href="/library">LIBRARY</Link>
        </div>
      </nav>

      <section style={{ width: "min(960px, calc(100% - 32px))", margin: "56px auto 0", color: "#f5f5f5" }}>
        <p style={{ margin: 0, color: "#b597f6", letterSpacing: "0.28em", textTransform: "uppercase", fontSize: 11 }}>
          Library
        </p>
        <h1 style={{ margin: "18px 0 12px", fontSize: "clamp(36px, 5vw, 64px)", letterSpacing: "-0.06em", lineHeight: 1 }}>
          Curated concepts and study notes.
        </h1>
        <p style={{ color: "#a0a0a0", fontSize: 17, lineHeight: 1.7, maxWidth: 780 }}>
          Collect the ideas, summaries, and references you want to revisit during your learning flow.
        </p>
      </section>
    </main>
  );
}
