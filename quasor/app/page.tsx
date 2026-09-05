"use client";

import Link from "next/link";
import { useState } from "react";
import QuasarSearch from "./components/QuasarSearch";
import QuasarIntro from "./components/QuasarIntro";
import QuasarBackground from "./components/QuasarBackground";
import QuasarOnboarding from "./components/QuasarOnboarding";

export default function Home() {
  const [stage, setStage] = useState<"onboarding" | "think" | "workspace">("onboarding");

  return (
    <main className="quasar-home">
      <QuasarBackground />
      <QuasarIntro onComplete={() => setStage("onboarding")} />
      {stage === "onboarding" && (
        <QuasarOnboarding onComplete={() => setStage("think")} />
      )}

      {/* ================= NAVBAR ================= */}
      {stage !== "onboarding" && <nav className="quasar-nav">

        <Link href="/" className="nav-brand">
          <span className="brand-symbol">✦</span>
          <span>QUASAR</span>
        </Link>

        <div className="nav-links">

          <Link href="/workspace">
            WORKSPACE
          </Link>

          <Link href="/code-lab">
            CODE LAB
          </Link>

          <Link href="/library">
            LIBRARY
          </Link>

        </div>

      </nav>}
      {/* ================= HOME ================= */}
      {stage !== "onboarding" && <section className={`quasar-search-shell quasar-stage-${stage}`}>

        <div className="quasar-hero">

          {/* QUASAR LOGO */}
          <div
            className="hero-logo"
            aria-label="Quasar logo"
          >
            <svg
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-hidden="true"
            >

              {/* Orbit */}
              <circle
                cx="50"
                cy="50"
                r="34"
                className="static-orbit"
              />

              {/* Beam */}
              <path
                d="M22 52 L78 52"
                className="static-beam"
              />

              {/* Core */}
              <circle
                cx="50"
                cy="52"
                r="8"
                className="static-core"
              />

            </svg>
          </div>


          {/* HERO TEXT */}
          <span className="quasar-eyebrow">QUASAR AI</span>
          <h1>
            Think beyond.
          </h1>

          <p>
            Learn, solve, create and understand with Quasar.
          </p>

        </div>


        {/* ================= BASIC HOME SEARCH ================= */}
        <div className="search-wrap">
          <QuasarSearch showHero={false} onFocus={() => setStage("workspace")} />
        </div>

      </section>}

      {stage === "workspace" && <section className="quasar-areas" aria-label="Quasar areas">
        <article className="quasar-area">
          <div>
            <span className="quasar-area__label">01 / LEARNING</span>
            <h2>Workspace</h2>
            <p>Your intelligent space for learning, reasoning, and solving doubts.</p>
            <span className="quasar-area__agent">Agent · Lyra</span>
          </div>
          <Link href="/workspace" className="quasar-area__cta">Open Workspace →</Link>
        </article>

        <article className="quasar-area">
          <div>
            <span className="quasar-area__label">02 / CREATION</span>
            <h2>Code Lab</h2>
            <p>Write, understand, debug, and improve code with intelligent assistance.</p>
            <span className="quasar-area__agent">Agent · Cygnus</span>
          </div>
          <Link href="/code-lab" className="quasar-area__cta">Open Code Lab →</Link>
        </article>

        <article className="quasar-area">
          <div>
            <span className="quasar-area__label">03 / KNOWLEDGE</span>
            <h2>Library</h2>
            <p>Your organized knowledge space for notes, resources, and learning material.</p>
          </div>
          <Link href="/library" className="quasar-area__cta">Open Library →</Link>
        </article>
      </section>}

    </main>
  );
}