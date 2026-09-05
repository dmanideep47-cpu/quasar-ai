"use client";

import React from "react";

type Props = {
  animate?: boolean;
  size?: number;
};

export default function QuasarMascot({ animate = false, size = 72 }: Props) {
  const wrapperStyle: React.CSSProperties = {
    width: size,
    height: size,
    position: "relative",
    margin: "0 auto",
    animation: animate ? "quasarFloat 3.6s ease-in-out infinite" : undefined,
    filter: animate ? "drop-shadow(0 6px 10px rgba(0,0,0,0.45))" : undefined,
  };

  const earStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    width: 17,
    height: 19,
    background: "var(--q-coral)",
  };

  const bodyStyle: React.CSSProperties = {
    position: "absolute",
    top: 12,
    left: 3,
    right: 3,
    bottom: 0,
    background: "var(--q-coral)",
    borderRadius: "2px 2px 0 0",
  };

  const eyeStyle: React.CSSProperties = {
    position: "absolute",
    top: 17,
    width: 8,
    height: 8,
    background: "#000",
  };

  const legStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    width: 10,
    height: 20,
    background: "#000",
  };

  return (
    <div
      className={"quasar-mascot" + (animate ? " animate" : "")}
      style={wrapperStyle}
      aria-label="Quasar mascot"
    >
      {/* left ear */}
      <div style={{ ...earStyle, left: 9 }} />

      {/* right ear */}
      <div style={{ ...earStyle, right: 9 }} />

      {/* body */}
      <div style={bodyStyle}>
        {/* left eye */}
        <span style={{ ...eyeStyle, left: 15 }} />

        {/* right eye */}
        <span style={{ ...eyeStyle, right: 15 }} />

        {/* legs/openings */}
        <div style={{ ...legStyle, left: 9 }} />
        <div style={{ ...legStyle, left: 26 }} />
        <div style={{ ...legStyle, right: 26 }} />
        <div style={{ ...legStyle, right: 9 }} />
      </div>
    </div>
  );
}
