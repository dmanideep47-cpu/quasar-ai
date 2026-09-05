"use client";

import { useEffect, useState } from "react";

type Props = { onComplete?: () => void };

export default function QuasarIntro({ onComplete }: Props) {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    document.body.classList.add("intro-active");

    const timer = setTimeout(() => {
      setShowIntro(false);
      document.body.classList.remove("intro-active");
      onComplete?.();
    }, 5200);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove("intro-active");
    };
  }, []);

  if (!showIntro) return null;

  return (
    <div className="quasar-intro">
      <div className="quasar-logo-animation">

        {/* Logo pieces */}
        <svg
          className="quasar-logo"
          viewBox="0 0 240 240"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Quasar"
        >
          {/* Outer orbital arc */}
          <path
            className="logo-piece orbit"
            d="M120 35
               C73 35 35 73 35 120
               C35 167 73 205 120 205"
          />

          {/* Second orbital arc */}
          <path
            className="logo-piece orbit orbit-delay"
            d="M120 205
               C167 205 205 167 205 120
               C205 73 167 35 120 35"
          />

          {/* Main diagonal energy beam */}
          <path
            className="logo-piece beam"
            d="M48 192 L192 48"
          />

          {/* Central core */}
          <circle
            className="logo-piece core"
            cx="120"
            cy="120"
            r="13"
          />

          {/* Small inner ring */}
          <circle
            className="logo-piece inner-ring"
            cx="120"
            cy="120"
            r="48"
          />
        </svg>

        {/* Wordmark */}
        <div className="quasar-wordmark">
          QUASAR
        </div>

        <div className="quasar-tagline">
          THINK BEYOND.
        </div>
      </div>
    </div>
  );
}