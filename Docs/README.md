# GrowEasy CSV Importer

AI-powered CSV importer for GrowEasy CRM leads. The app lets an operator upload any valid lead CSV, preview the raw rows in the browser, confirm the import, then sends the file to a backend that maps messy CSV data into GrowEasy CRM records.

## Tech Stack

- Repository shape: three top-level folders with `Docs` as the command center
- Frontend: Next.js App Router, React, Tailwind CSS, TanStack Table, TanStack Query, Papa Parse, lucide-react
- Backend: Node.js, Express, Multer, csv-parse, Google Gen AI SDK for Vertex AI, Zod, p-limit
- Shared contracts: `Backend/shared` Zod schemas and CRM constants
- Tests: Vitest, React Testing Library, Supertest

## Project Structure

```text
Frontend/               Next.js GrowEasy-style dashboard and CSV import UI
  .env.example          Optional frontend public API URL example
Backend/                Express API for CSV upload, parsing, AI extraction
  .env.example          Backend runtime env example for local development
  shared/               Shared CRM constants, Zod schemas, and TypeScript types
Docs/                   Project docs, shared tooling config, and orchestration scripts
  README.md             Setup, API, env vars, verification, deployment
  ARCHITECTURE.md       System design, data flow, and security notes
  Context.md            Working project context and change log
```

## Setup

This machine has Node through NVM. If `node` is not on your shell PATH, run:

```bash
export PATH="$HOME/.nvm/versions/node/v24.16.0/bin:$PATH"
```

Install dependencies:

```bash
npm --prefix Docs run setup
```

Create local API env values when needed:

```bash
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env.local
```

`Frontend/.env.local` is optional for local development because the web app defaults to `http://localhost:4000`.

Run both apps:

```bash
npm --prefix Docs run dev
```

- Web: `http://127.0.0.1:3000`
- API: `http://localhost:4000`
- Health check: `http://localhost:4000/health`

## LLM Configuration

The API is configured to use Google Vertex AI:

```bash
LLM_PROVIDER=vertex
VERTEX_PROJECT_ID=alien-slice-499511-f8
VERTEX_LOCATION=global
VERTEX_MODEL=gemini-2.5-flash
```

Local API env values are in `Backend/.env`. Vertex authentication uses Google Application Default Credentials or `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service-account JSON file. Do not commit service-account JSON files.

For deterministic local development or tests, set:

```bash
LLM_PROVIDER=local-fallback
```

## Core Flow

1. Browser parses the selected CSV with Papa Parse for preview only.
2. No AI request is made during preview.
3. On confirmation, the original CSV file is uploaded to `POST /api/imports/extract`.
4. The API validates file type and size, then reparses the CSV server-side.
5. Rows are sent to the extractor in bounded batches.
6. Vertex AI Gemini returns strict JSON matching the shared schema, or local fallback runs when configured.
7. Records are normalized and validated with Zod.
8. The UI displays imported records, skipped rows, errored rows, totals, and batch diagnostics.

## Sample CSV Template

The upload modal includes a `Download Sample CSV Template` action. It downloads
a header-only GrowEasy CRM template so users can prepare their own lead CSV
without triggering any backend or AI processing.

## Supported CSV Shapes

The importer is designed to handle flexible lead exports, including:

- Facebook Lead Export
- Google Ads Export
- Excel sheets
- Real estate CRM exports
- Sales reports
- Marketing agency CSVs
- Manually created spreadsheets

Vertex handles unfamiliar headers after confirmation, and the local fallback
recognizes common export headers such as `created_time`, `customer phone`,
`campaign_name`, `deal stage`, `assigned agent`, `property type`, `UTM Source`,
`First Name`, and `Last Name`.

## AI Mapping Contract

- The model receives the detected headers and a batch of raw row objects.
- The model must return every input `rowNumber` exactly once, either in `records` or `skipped`.
- Backend validation owns final cleanup: allowed CRM status/source values, date parseability, first email/phone selection, extra contact notes, and missing-contact skips.
- Provider/runtime failures are not treated as skipped data. After retries, affected rows are returned in `errored` with the original source row and reason.

## API

### `GET /health`

Returns service status.

### `POST /api/imports/extract`

Multipart form upload:

- field name: `file`
- allowed type: `.csv`
- default max size: `10MB`

Response shape:

```ts
{
  records: CrmLeadRecord[];
  skipped: SkippedRecord[];
  errored: ErroredRecord[];
  summary: {
    totalRows: number;
    imported: number;
    skipped: number;
    errored: number;
    batches: number;
    durationMs: number;
    aiProvider: "vertex" | "local-fallback";
  };
  diagnostics: BatchDiagnostic[];
}
```

## Environment Variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | API port |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed frontend origin |
| `MAX_UPLOAD_MB` | `10` | Upload size cap |
| `MAX_CSV_ROWS` | `5000` | Server-side row cap |
| `AI_BATCH_SIZE` | `25` | Rows per AI call |
| `AI_BATCH_CONCURRENCY` | `2` | Parallel AI batches |
| `AI_MAX_RETRIES` | `2` | Retry count for failed AI batches |
| `LLM_PROVIDER` | `vertex` | `vertex` or `local-fallback` |
| `VERTEX_PROJECT_ID` | `alien-slice-499511-f8` | Google Cloud project for Vertex AI |
| `VERTEX_LOCATION` | `global` | Vertex AI location |
| `VERTEX_MODEL` | `gemini-2.5-flash` | Gemini model ID |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Frontend API base URL |

## Verification

```bash
npm --prefix Docs run typecheck
npm --prefix Docs run lint
npm --prefix Docs run test
npm --prefix Docs run build
npm --prefix Docs run audit:prod
```

Current audit status:

- `npm --prefix Docs run audit:prod` exits cleanly: no high or critical production advisories in Backend or Frontend.
- Full audit is clean for Frontend and Docs.
- Backend and Backend/shared full audit still report one low dev-tooling advisory through `esbuild@0.27.7` used by `tsup` tooling.

Latest local verification on 2026-07-07:

- `npm --prefix Docs run typecheck`
- `npm --prefix Docs run lint`
- `npm --prefix Docs run test` - 21 tests passed
- `npm --prefix Docs run build`
- `npm --prefix Docs run audit:prod`
- Live API smoke: semicolon CSV from `Origin: http://127.0.0.1:3000` returned 1 imported, 1 skipped, 0 errored with `aiProvider: "vertex"`

## Deployment

Recommended first deployment:

- Web: Vercel from `Frontend`
- API: Railway or Render from `Backend`
- Set `NEXT_PUBLIC_API_URL` on Vercel to the deployed API URL
- Set `CORS_ORIGIN` on the API to the deployed frontend URL
- Store Google service-account credentials only in the API hosting environment or use Workload Identity on Google Cloud

The first version is stateless. Add a database only when import history, user accounts, audit trails, or saved mappings become required.
