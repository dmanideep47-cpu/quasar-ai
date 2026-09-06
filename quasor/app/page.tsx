"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import QuasarSearch from "./components/QuasarSearch";
import QuasarIntro from "./components/QuasarIntro";
import QuasarBackground from "./components/QuasarBackground";
import QuasarOnboarding from "./components/QuasarOnboarding";

export default function Home() {
  const [stage, setStage] = useState<"onboarding" | "think" | "workspace">("onboarding");
  const [animState, setAnimState] = useState<"idle" | "collapsing" | "collapsed">("idle");
  const collapseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current !== null) {
        window.clearTimeout(collapseTimerRef.current);
      }
    };
  }, []);

  function handleSearchSubmitted() {
    if (collapseTimerRef.current !== null) {
      window.clearTimeout(collapseTimerRef.current);
    }

    setAnimState("collapsing");
    collapseTimerRef.current = window.setTimeout(() => {
      setAnimState("collapsed");
      collapseTimerRef.current = null;
    }, 4000);
  }

  return (
    <main className={`quasar-home galaxy-state-${animState}`}>
      <QuasarBackground animationState={animState} />
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
          <QuasarSearch
            showHero={false}
            onFocus={() => setStage("workspace")}
            onSubmitted={handleSearchSubmitted}
          />
        </div>

      </section>}

    </main>
  );
}