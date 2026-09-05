"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CodeEditor from "../components/CodeEditor";
import CygnusPanel from "../components/CygnusPanel";
import {
  Challenge,
  Difficulty,
  Language,
  Topic,
  challenges,
  getRandomChallenge,
} from "../lib/challenges";

type TabState = {
  challenge: Challenge;
  code: string;
  output: string;
  executionResult: any;
};
type BottomTab = "problems" | "output" | "terminal" | "tests";

const languageNames: Record<Language, string> = {
  python: "Python",
  javascript: "JavaScript",
  java: "Java",
  sql: "SQL",
};

export default function CodeLabPage() {
  const [view, setView] = useState<"landing" | "challenge">("landing");
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [tabs, setTabs] = useState<TabState[]>([]);
  const [activeId, setActiveId] = useState("");
  const [bottomTab, setBottomTab] = useState<BottomTab>("output");
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [problemOpen, setProblemOpen] = useState(false);
  const [bottomOpen, setBottomOpen] = useState(false);
  const [cygnusOpen, setCygnusOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const active = tabs.find((tab) => tab.challenge.id === activeId) || null;
  const activeIsDirty = Boolean(active && active.code !== active.challenge.starter);
  const executionProblem = active?.executionResult && active.executionResult.status !== "passed"
    ? active.executionResult.errorMessage ||
      active.executionResult.stderr ||
      `Code ${active.executionResult.status.replace("_", " ")}`
    : "";
  const topics = selectedLanguage
    ? Array.from(new Set(challenges.filter((c) => c.language === selectedLanguage).map((c) => c.topic)))
    : [];
  const difficulties = selectedLanguage && selectedTopic
    ? Array.from(new Set(challenges.filter((c) => c.language === selectedLanguage && c.topic === selectedTopic).map((c) => c.difficulty)))
    : [];
  const available = useMemo(
    () => challenges.filter((challenge) =>
      (!selectedLanguage || challenge.language === selectedLanguage) &&
      (!selectedTopic || challenge.topic === selectedTopic) &&
      (!selectedDifficulty || challenge.difficulty === selectedDifficulty),
    ),
    [selectedLanguage, selectedTopic, selectedDifficulty],
  );

  const openChallenge = (challenge: Challenge) => {
    setTabs((current) => current.some((tab) => tab.challenge.id === challenge.id)
      ? current
      : [...current, { challenge, code: challenge.starter, output: "", executionResult: null }]);
    setActiveId(challenge.id);
    setView("challenge");
  };

  const openQuickEditor = () => {
    if (!selectedLanguage) return;
    openChallenge({
      id: `quick-${selectedLanguage}`,
      title: "Untitled",
      description: "Write and run your own code.",
      language: selectedLanguage,
      topic: "Debugging",
      difficulty: "Easy",
      starter:
        selectedLanguage === "python"
          ? 'print("hi")\n'
          : selectedLanguage === "java"
            ? 'System.out.println("hi");\n'
            : selectedLanguage === "javascript"
              ? 'console.log("hi");\n'
              : "-- SQL execution is not available yet\n",
      examples: [],
      constraints: [],
      testCases: [],
    });
  };

  const updateActive = (patch: Partial<TabState>) => {
    setTabs((current) => current.map((tab) => tab.challenge.id === activeId ? { ...tab, ...patch } : tab));
  };

  const closeTab = (id: string) => {
    const next = tabs.filter((tab) => tab.challenge.id !== id);
    setTabs(next);
    if (id === activeId) {
      setActiveId(next[next.length - 1]?.challenge.id || "");
      if (!next.length) setView("landing");
    }
  };

  const runCode = async (submit = false) => {
    if (!active || isRunning) return;
    setIsRunning(true);
    setBottomOpen(true);
    setBottomTab("output");
    updateActive({ output: "Running code..." });
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: active.code,
          language: active.challenge.language,
          testCases: submit ? active.challenge.testCases : [],
        }),
      });
      if (!response.ok) throw new Error("Execution failed");
      const data = await response.json();
      const hasTests = Boolean(data.tests && data.tests.total > 0);
      let text = hasTests
        ? data.status === "passed" ? "✓ All tests passed\n" : data.status === "failed" ? "✕ Some tests failed\n" : `${data.status || "Execution"}\n`
        : data.status === "passed" ? "" : `${data.status || "Execution"}\n`;
      if (hasTests) text += `\nTests: ${data.tests.passed}/${data.tests.total} passed\n`;
      if (data.errorMessage || data.stderr) text += `\n${data.errorMessage || data.stderr}\n`;
      if (data.stdout) text += `\n${data.stdout}`;
      text += `\n\nExecution time: ${data.executionTimeMs ?? 0}ms`;
      updateActive({ output: text, executionResult: data });
    } catch (error) {
      updateActive({ output: `Error: ${error instanceof Error ? error.message : "Unknown error"}` });
    } finally {
      setIsRunning(false);
    }
  };

  if (view === "landing") {
    return (
      <main className="code-lab-landing">
        <div className="code-lab-landing-inner">
          <Link href="/?intro=1" className="nav-link">← Back</Link>
          <div className="hero-center"><div className="hero-logo-badge">✦</div><h1 className="hero-title">CodeLab</h1><p className="hero-subtitle">Master coding with AI-powered mentorship</p><p className="hero-description">Solve challenges, get real-time hints, and level up your skills.</p></div>
          <section className="selector-panel" aria-label="Challenge filters">
            <div className="selector-row">
              <label className="selector-column">Language<select className="selector-input" value={selectedLanguage || ""} onChange={(e) => { setSelectedLanguage(e.target.value as Language || null); setSelectedTopic(null); setSelectedDifficulty(null); }}><option value="">Select language</option>{(Object.keys(languageNames) as Language[]).map((l) => <option key={l} value={l}>{languageNames[l]}</option>)}</select></label>
              {topics.length > 0 && <label className="selector-column">Topic<select className="selector-input" value={selectedTopic || ""} onChange={(e) => { setSelectedTopic(e.target.value as Topic); setSelectedDifficulty(null); }}><option value="">Select topic</option>{topics.map((t) => <option key={t}>{t}</option>)}</select></label>}
              {difficulties.length > 0 && <label className="selector-column">Difficulty<select className="selector-input" value={selectedDifficulty || ""} onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}><option value="">Select difficulty</option>{difficulties.map((d) => <option key={d}>{d}</option>)}</select></label>}
            </div>
            <div className="selector-actions"><button className="action-btn primary" disabled={!selectedLanguage || !selectedTopic || !selectedDifficulty} onClick={() => openChallenge(available[0])}>Start Practice</button><button className="action-btn secondary" onClick={() => { const c = getRandomChallenge(selectedLanguage || undefined, selectedTopic || undefined, selectedDifficulty || undefined); if (c) openChallenge(c); }}>Random Challenge</button><button className="action-btn editor-action" disabled={!selectedLanguage} onClick={openQuickEditor}>Open Quick Editor</button></div>
          </section>
          {available.length > 0 && selectedLanguage && <div className="challenges-grid"><h3 className="grid-title">Available challenges</h3><div className="grid-list">{available.map((c) => <button key={c.id} className="grid-card" onClick={() => openChallenge(c)}><span>{c.title}</span><span className={`badge badge-${c.difficulty.toLowerCase()}`}>{c.difficulty}</span><small>{c.description}</small></button>)}</div></div>}
        </div>
      </main>
    );
  }

  if (!active) return null;
  const filteredChallenges = challenges.filter((challenge) => {
    const query = searchQuery.trim().toLowerCase();
    return !query || `${challenge.title} ${challenge.topic} ${challenge.language}`.toLowerCase().includes(query);
  });
  return (
    <main className="code-lab-ide">
      <header className="ide-topbar"><button className="ide-brand" onClick={() => setView("landing")} aria-label="Back to CodeLab home"><span className="ide-brand-mark">✦</span><strong>QUASAR</strong><span className="ide-brand-divider">/</span><span>CodeLab</span></button><label className="ide-command-search"><span>⌕</span><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search challenges, files, or run a command..." aria-label="Search CodeLab" /></label><span className="ide-context">Workspace / {active.challenge.title}</span><div className="ide-top-actions"><button className="run-top-button" disabled={isRunning} title="Run code" aria-label="Run code" onClick={() => runCode(false)}>{isRunning ? "Running..." : "▶ Run"}</button><button className="submit-top-button" disabled={isRunning} title="Run solution against available tests" onClick={() => runCode(true)}>Submit</button><button title="Back to challenges" aria-label="Back to challenges" onClick={() => setView("landing")}>Challenges</button></div></header>
      <div className="ide-body">
        <nav className="ide-activity" aria-label="Activity bar"><button className={explorerOpen ? "selected" : ""} onClick={() => setExplorerOpen(!explorerOpen)} title="Explorer" aria-label="Toggle explorer">☷</button><button className={problemOpen ? "selected" : ""} onClick={() => setProblemOpen(!problemOpen)} title="Problem" aria-label="Toggle problem">▤</button><button className={cygnusOpen ? "selected" : ""} onClick={() => setCygnusOpen(!cygnusOpen)} title="Cygnus" aria-label="Toggle Cygnus">✦</button><button onClick={() => setView("landing")} title="Challenges" aria-label="Open challenges">◇</button></nav>
        {explorerOpen && <aside className="ide-explorer resizable-dock"><div className="ide-section-title"><span>EXPLORER</span><button className="dock-close" onClick={() => setExplorerOpen(false)} aria-label="Collapse explorer">×</button></div><div className="filter-stack"><select value={selectedLanguage || active.challenge.language} onChange={(e) => setSelectedLanguage(e.target.value as Language)}><option value="">All languages</option>{(Object.keys(languageNames) as Language[]).map((l) => <option key={l} value={l}>{languageNames[l]}</option>)}</select><select value={selectedTopic || ""} onChange={(e) => setSelectedTopic(e.target.value as Topic || null)}><option value="">All topics</option>{Array.from(new Set(challenges.map((c) => c.topic))).map((t) => <option key={t}>{t}</option>)}</select><select value={selectedDifficulty || ""} onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty || null)}><option value="">All difficulties</option>{(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => <option key={d}>{d}</option>)}</select></div><div className="challenge-list">{filteredChallenges.filter((c) => (!selectedLanguage || c.language === selectedLanguage) && (!selectedTopic || c.topic === selectedTopic) && (!selectedDifficulty || c.difficulty === selectedDifficulty)).map((c) => <button className={`challenge-row ${c.id === activeId ? "active" : ""}`} key={c.id} onClick={() => openChallenge(c)}><span className="file-icon">{c.language === "sql" ? "◇" : "◈"}</span><span>{c.title}</span><small>{c.difficulty[0]}</small></button>)}</div></aside>}
        <section className="ide-workspace">
          <div className="ide-tabs">{tabs.map((tab) => <button key={tab.challenge.id} className={tab.challenge.id === activeId ? "active" : ""} onClick={() => setActiveId(tab.challenge.id)}>{tab.code !== tab.challenge.starter && <span className="unsaved-dot" aria-label="Unsaved changes">●</span>}{languageNames[tab.challenge.language]} · {tab.challenge.title}<span onClick={(e) => { e.stopPropagation(); closeTab(tab.challenge.id); }} aria-label={`Close ${tab.challenge.title}`} title="Close">×</span></button>)}<button className="new-tab-button" onClick={() => setView("landing")} aria-label="Open a new challenge" title="Open a new challenge">+</button></div>
          {problemOpen && <section className="problem-panel ide-panel resizable-panel"><div className="ide-panel-heading"><span>PROBLEM</span><button onClick={() => setProblemOpen(false)} aria-label="Collapse problem">⌃</button></div><div className="problem-content"><div className="problem-title-row"><h1>{active.challenge.title}</h1><span className={`badge badge-${active.challenge.difficulty.toLowerCase()}`}>{active.challenge.difficulty}</span></div><p>{active.challenge.description}</p><h3>Examples</h3>{active.challenge.examples.map((ex, i) => <div className="example" key={i}><code>Input&nbsp; {ex.input}</code><code>Output {ex.output}</code></div>)}<h3>Constraints</h3><ul>{active.challenge.constraints.map((c) => <li key={c}>{c}</li>)}</ul><h3>Expected behavior</h3><p>Implement the solution in {languageNames[active.challenge.language]} and return the expected result for every test case.</p></div></section>}
          <section className="editor-panel ide-panel"><div className="ide-panel-heading"><span>{active.challenge.title}.{active.challenge.language === "javascript" ? "js" : active.challenge.language}</span><span className="editor-status">{isRunning ? "● Running" : activeIsDirty ? "● Unsaved" : "● Ready"}</span></div><CodeEditor value={active.code} onChange={(code) => updateActive({ code })} language={active.challenge.language} height="100%" /><button className="editor-run" disabled={isRunning} onClick={() => runCode(false)}>{isRunning ? "Running..." : "▶ Run code"} <kbd>Ctrl ↵</kbd></button></section>
          {bottomOpen && <section className="bottom-panel ide-panel"><div className="bottom-tabs">{(["problems", "output", "terminal", "tests"] as BottomTab[]).map((tab) => <button className={bottomTab === tab ? "active" : ""} key={tab} onClick={() => setBottomTab(tab)}>{tab === "problems" ? "Problems" : tab[0].toUpperCase() + tab.slice(1)}{tab === "tests" && active.executionResult?.tests ? ` (${active.executionResult.tests.passed}/${active.executionResult.tests.total})` : ""}{tab === "problems" && executionProblem ? " (1)" : ""}</button>)}<button className="collapse-button" onClick={() => setBottomOpen(false)} aria-label="Collapse bottom panel">⌄</button></div><div className="bottom-content"><pre>{bottomTab === "tests" ? (active.executionResult?.tests ? JSON.stringify(active.executionResult.tests, null, 2) : "Run code to see test results.") : bottomTab === "output" ? (active.output || "No output yet. Run your code to see results.") : bottomTab === "terminal" ? "$ codelab ready\n" : executionProblem || "No problems detected."}</pre></div></section>}
        </section>
        {cygnusOpen && <aside className="cygnus-dock resizable-dock"><div className="dock-heading"><span>CYGNUS</span><button onClick={() => setCygnusOpen(false)} aria-label="Collapse Cygnus">›</button></div><CygnusPanel problem={active.challenge.description} code={active.code} language={active.challenge.language} topic={active.challenge.topic} difficulty={active.challenge.difficulty} executionResult={active.executionResult} /></aside>}
      </div>
      <footer className="ide-statusbar"><span>{languageNames[active.challenge.language]} 3.x</span><span>Ln 1, Col 1</span><span>Spaces: 4</span><span>UTF-8</span><span className="status-spacer" /><span>{active.challenge.title}.{active.challenge.language === "javascript" ? "js" : active.challenge.language}</span><span>{isRunning ? "Running" : "Ready"}</span></footer>
    </main>
  );
}
