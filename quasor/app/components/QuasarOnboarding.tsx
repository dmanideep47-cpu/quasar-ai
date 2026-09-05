"use client";

import { useState } from "react";

type Props = { onComplete: () => void };

const slides = [
  {
    eyebrow: "QUASAR",
    title: "Think beyond simple answers.",
    description:
      "Quasar is an intelligent AI workspace built to help you learn, solve, create, and understand complex ideas.",
  },
  {
    eyebrow: "HOW QUASAR THINKS",
    title: "From question to understanding.",
    description:
      "Quasar understands your question, connects relevant knowledge, reasons through the problem, and delivers a clear, useful answer.",
    flow: ["QUESTION", "UNDERSTAND", "REASON", "CONNECT", "ANSWER"],
  },
  {
    eyebrow: "LYRA + CYGNUS",
    title: "Intelligence with different strengths.",
    description: "",
    agents: [
      ["LYRA", "Creative intelligence for transforming ideas into concepts, content, and possibilities."],
      ["CYGNUS", "Reasoning intelligence for breaking down complex problems, analyzing information, and discovering deeper connections."],
    ],
  },
  {
    eyebrow: "LIBRARY",
    title: "Everything you discover stays connected.",
    description:
      "Library keeps your conversations, discoveries, resources, and generated work organized so you can return to them and continue building.",
  },
];

export default function QuasarOnboarding({ onComplete }: Props) {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <section className="quasar-onboarding" aria-label="Getting started with Quasar">
      <div
        className="quasar-onboarding__track"
        onScroll={(event) => {
          const target = event.currentTarget;
          setActiveSlide(Math.round(target.scrollTop / target.clientHeight));
        }}
      >
        {slides.map((slide, index) => (
          <article className="quasar-onboarding__slide" key={slide.eyebrow}>
            <div className="quasar-onboarding__content">
              <span className="quasar-onboarding__eyebrow">{slide.eyebrow}</span>
              <span className="quasar-onboarding__index">0{index + 1} / 04</span>
              <h1>{slide.title}</h1>
              {slide.description && <p>{slide.description}</p>}
              {slide.flow && (
                <div className="quasar-onboarding__flow" aria-label="Question to answer process">
                  {slide.flow.map((item) => <span key={item}>{item}</span>)}
                </div>
              )}
              {slide.agents && (
                <div className="quasar-onboarding__agents">
                  {slide.agents.map(([name, text]) => (
                    <div key={name} className="quasar-onboarding__agent">
                      <strong>{name}</strong>
                      <p>{text}</p>
                    </div>
                  ))}
                </div>
              )}
              {index === slides.length - 1 && (
                <button type="button" className="quasar-onboarding__start" onClick={onComplete}>
                  GET STARTED <span>→</span>
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      <div className="quasar-onboarding__dots" aria-label={`Slide ${activeSlide + 1} of 4`}>
        {slides.map((slide, index) => <span className={index === activeSlide ? "is-active" : ""} key={slide.eyebrow} />)}
      </div>
    </section>
  );
}
