# Quasor CodeLab

Quasor is a learning-focused coding workspace built around a CodeLab experience and an AI-assisted mentor. The repository includes a Next.js application and a documented retrieval-augmented generation (RAG) pipeline for Python learning material.

> This README describes the repository structure and intended capabilities. Check the project status and testing documents before assuming every documented component is currently production-ready.

## What's Inside

- **CodeLab:** coding workspace with an editor and challenge-oriented learning flow
- **CYGNUS mentor:** AI-assisted explanations and contextual learning support
- **RAG knowledge pipeline:** markdown ingestion, chunking, embeddings, and vector-storage components
- **API routes:** application endpoints for AI-assisted interactions and code execution
- **Project notes:** implementation status, setup notes, testing records, and next steps

## Tech Stack

- Next.js 15, React 18, TypeScript
- Tailwind CSS
- Google Generative AI SDK
- PostgreSQL with pgvector for the documented vector-storage path
- Markdown/math rendering with React Markdown and KaTeX

## Repository Layout

The application lives in [quasor/](./quasor/).

- [quasor/README.md](./quasor/README.md) — detailed documentation index
- [quasor/PROJECT_STATUS.md](./quasor/PROJECT_STATUS.md) — project status and architecture notes
- [quasor/BUG_REPORT_AND_TESTING.md](./quasor/BUG_REPORT_AND_TESTING.md) — testing notes
- [quasor/backend/](./quasor/backend/) — RAG ingestion and vector-storage components
- [quasor/codelab-knowledge/](./quasor/codelab-knowledge/) — learning content used by the knowledge pipeline

## Run Locally

Requirements: a compatible Node.js version, npm, and any environment variables required by the features you enable.

```bash
git clone https://github.com/dmanideep47-cpu/quasar-ai.git
cd quasar-ai
npm install
npm run dev
```

Open the local URL printed by Next.js. The root scripts delegate to the Next.js application in quasor/.

Before running AI or database-backed features, inspect the project's environment-variable usage and configure your own credentials locally. **Never commit API keys, database passwords, or .env.local files.** Do not use production credentials in a public demo.

## Verify Before You Run

```bash
npm run lint
npm run build
```

If a command fails, use the output to identify the current issue; historical status documents may not reflect the latest code state.

## Project Status

This is an actively developed project. For the most accurate feature and setup details, start with the [documentation index](./quasor/README.md) and [project status](./quasor/PROJECT_STATUS.md). Contributions and issue reports should include reproducible steps and relevant, redacted logs.

## About the Developer

Built as part of my learning journey toward becoming an **Agentic AI Engineer**, with a current focus on programming fundamentals, backend development, data handling, and practical AI systems.

[GitHub profile](https://github.com/dmanideep47-cpu) · [Daily learning log](https://github.com/dmanideep47-cpu/daily-dev-log) · [Java DSA practice](https://github.com/dmanideep47-cpu/leetcode-solutions)
