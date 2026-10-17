# Quasor CodeLab

Quasor is a learning-focused coding workspace with an AI mentor and a retrieval-augmented learning pipeline. The application is built with Next.js, React, and TypeScript; the RAG documentation describes Python ingestion/retrieval components and a PostgreSQL + pgvector storage path.

> **Project status:** This repository contains implementation code and development notes. The documentation includes dated progress reports, planned work, and declared completion steps. Treat those reports as snapshots, not proof of a production deployment. Run the checks below and verify the current code/configuration before relying on a feature.

## Core areas

- **CodeLab:** challenge-oriented coding workspace with an editor and execution feedback.
- **CYGNUS:** AI mentor designed to use code, errors, test results, and learning context.
- **Knowledge pipeline:** Markdown learning material, chunking, embeddings, retrieval, and vector-storage components.
- **Documentation:** architecture notes, implementation reports, testing guidance, and known limitations.

## Run the application

From the repository root:

```bash
npm ci
npm run dev
```

The root npm script starts the Next.js app on port **3001**. Use the URL printed in your terminal.

Before using AI-backed or database-backed features, inspect the environment-variable requirements in the relevant code and documentation. Configure credentials locally; never commit API keys, database passwords, or real environment files.

## Verify changes

From the repository root:

```bash
npm run lint
npm run build
```

For the RAG path, review the component-specific instructions before setting up dependencies and PostgreSQL/pgvector. A successful frontend build alone does not verify embeddings, database ingestion, retrieval quality, code-execution isolation, or the end-to-end AI flow.

## Technical documentation

- [Repository overview and setup](../README.md)
- [Project status notes](./PROJECT_STATUS.md) — dated development snapshot
- [RAG system notes](./RAG_SYSTEM_READY.md) — implementation overview; verify against the current code
- [Step 9: execution-aware CYGNUS integration](./STEP_9_IMPLEMENTATION_COMPLETE.md) — implementation report and manual test checklist
- [Bug report and testing notes](./BUG_REPORT_AND_TESTING.md)
- [RAG ingestion](./backend/rag/ingestion/README.md)
- [Vector storage](./backend/rag/vectors/README.md)

## Engineering priorities

The next strongest improvements are repeatable automated tests, a reproducible local setup, visible screenshots or a short demo, documented environment variables, and measured retrieval quality with representative queries. Keep the README and status reports aligned with the actual code as the project evolves.

---

Built as a learning project focused on programming, AI-assisted education, and practical RAG engineering.
