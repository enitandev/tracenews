# TraceNews

TraceNews is the reader-facing frontend for the TraceNews platform. It is a React application built with Vite, responsible for rendering breaking news stories, clusters, and the Monitoring Spirit Verdict Cards that indicate structural reporting anomalies.

## Running Locally

1. Install Node.js dependencies:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Directory Structure

- `src/` – Core React application logic, UI components, pages, routing, and styling definitions.
- `public/` – Static assets that bypass the build pipeline.
- `docs/` – Stores architecture documentation and legacy reference files (e.g., `design-references/`).

## Environment Variables

Frontend configuration and secrets are documented and stored locally in the `.env` file at the project root (gitignored). These variables are typically prefixed with `VITE_` and include endpoint URLs for connecting to the tracenews-api backend and the Supabase instance.
