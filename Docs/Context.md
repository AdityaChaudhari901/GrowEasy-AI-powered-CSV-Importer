# GrowEasy CSV Importer Context

Last updated: 2026-07-07

## Project Goal

Build an AI-powered CSV importer for GrowEasy that accepts messy lead CSV files, previews them before AI processing, and converts confirmed imports into GrowEasy CRM lead records.

The assignment evaluates AI extraction accuracy, backend quality, frontend polish, type safety, maintainability, edge-case handling, and production readiness.

## Core Product Flow

1. Upload a CSV through drag and drop or file picker.
2. Parse and preview the CSV incrementally in the browser.
3. Show a bounded, virtualized, scrollable CSV preview before any AI call.
4. Wait for user confirmation.
5. Send the CSV to the backend only after confirmation.
6. Process records through an AI model in batches.
7. Return structured JSON with imported records, skipped records, errored records, totals, and batch diagnostics.
8. Display parsed CRM records, skipped rows, and errored rows in responsive tables.

## CRM Output Fields

The normalized GrowEasy CRM record must support:

- `created_at`
- `name`
- `email`
- `country_code`
- `mobile_without_country_code`
- `company`
- `city`
- `state`
- `country`
- `lead_owner`
- `crm_status`
- `crm_note`
- `data_source`
- `possession_time`
- `description`

Allowed `crm_status` values:

- `GOOD_LEAD_FOLLOW_UP`
- `DID_NOT_CONNECT`
- `BAD_LEAD`
- `SALE_DONE`

Allowed `data_source` values:

- `leads_on_demand`
- `meridian_tower`
- `eden_park`
- `varah_swamy`
- `sarjapur_plots`

If a source is not confidently matched, leave `data_source` blank.

Skip any record with neither email nor mobile number.

## Assignment Compliance Snapshot

- Frontend supports CSV upload from Lead Sources only.
- Browser preview parses the selected CSV before any backend or AI call and reports row-level parse progress.
- Browser preview detects comma, semicolon, and tab delimiters, strips BOM headers, and blocks duplicate or empty headers.
- The preview modal uses a scrollable virtualized table that shows every parsed CSV column without pagination controls.
- Confirming `Import & Process with AI` sends the original CSV to the backend after explicit user consent.
- Successful import redirects to `#manage-leads` and renders normalized CRM records.
- The import modal shows a four-step Upload / Preview / Confirm / Process stepper and keeps the confirmation footer visible.
- Lead names are interactive and open a tabbed details panel.
- Backend accepts valid CSV uploads, reparses server-side, batches AI extraction, validates output with Zod, skips rows without email or mobile, and marks provider/batch failures as errored rows.
- Vertex AI is the configured LLM provider through `LLM_PROVIDER=vertex`.

## Reference Screenshots

The user provided three GrowEasy reference screenshots in chat.

### Upload Modal

- Page context: GrowEasy dashboard with left sidebar and dimmed overlay.
- Modal title: `Import Leads via CSV`.
- Large centered Aceternity file-upload surface with drag/drop and click upload.
- Animated upload tile appears inside the upload surface.
- Helper text mentions `.csv` support and max file size.
- Company sample CSV button appears inside the drop zone.
- Footer has two large actions: `Cancel` and `Upload File`.
- Upload action is disabled or pale before file selection, then bright orange after selection.

### CSV Preview Modal

- Same modal shell and overlay.
- Selected file appears in a compact file card with CSV icon, file name, size, and remove icon.
- A compact table preview appears inside the modal.
- Preview rows prioritize GrowEasy lead fields and paginate in 50-row pages.
- Footer keeps `Cancel` and primary `Upload File`.

### Manage Leads Table

- Left sidebar persists.
- Main content title: `Manage Your Leads`.
- Table-first layout with search input, refresh action, status badges, and row actions.
- Visual style is light, rounded, quiet, and operational.
- Active nav item uses pale teal.
- Primary brand/action color uses deep teal; import confirmation action uses orange.

## UI Direction

This is an internal lead-operations tool, not a landing page.

Design intent:

- Dense enough for CRM work.
- Calm enough for reviewing messy data.
- Polished enough to match GrowEasy dashboard screenshots.
- Clear about when AI has not run yet.

Domain concepts:

- Lead source
- CSV import
- Contactability
- CRM status
- Follow-up queue
- Batch processing
- Skipped records
- Field mapping confidence

Color world:

- Canvas white: page and modal background.
- Soft teal: selected nav, upload icon background, sample CSV button.
- Deep teal: primary controls, focus state, success accents.
- Warm orange: final import/upload action.
- Cool gray: overlay, borders, secondary text.
- Pale green/blue badges: lead quality and completion states.
- Live GrowEasy site reference adds a white-first AI CRM feel, while the current two-screen UI reference adds compact CRM-console density:
  - White/off-white canvas and white cards.
  - GrowEasy teal `#276159` for brand, focus, and primary action.
  - Orange `#F57141` reserved for final confirmation and progress emphasis.
  - Space Grotesk headings, Inter body copy, and IBM Plex Mono metadata.

UI components to build:

- App shell with sidebar matching reference structure.
  - Desktop sidebar uses a compact hover-expanded rail, quiet borders, small brand block, and tight nav rows without bottom helper copy.
- Import modal with upload state and preview state.
- CSV drop zone with file picker fallback.
- Virtualized scrollable CSV preview for the import modal.
- Responsive virtualized data tables with sticky headers for Manage Leads results.
- Import progress section for AI batch processing.
- Results summary cards for total/imported/skipped/errored totals.
- Parsed records table.
- Skipped records table with reasons.
- Errored records table with reasons.
- Error and empty states.

## Tech Stack

### Repository Shape

Use exactly three top-level folders:

```text
Frontend/
Backend/
  shared/
Docs/
```

`Docs` owns project documentation, shared TypeScript/ESLint config, and orchestration scripts. `Frontend` and `Backend` are standalone npm projects; `Backend/shared` remains the shared contract package.

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui-style primitives where useful
- lucide-react for icons
- Papa Parse for browser CSV preview
- TanStack Table for table structure
- Custom fixed-row virtualization for large CSV/table rendering
- Persisted light/dark theme toggle
- React Hook Form only if forms become complex

### Backend

- Node.js
- Express
- TypeScript
- Multer or Busboy for CSV upload handling
- csv-parse for server-side CSV parsing
- Google Gen AI SDK for Vertex AI extraction
- Zod for schema validation and shared typed contracts
- p-limit for bounded AI batch concurrency
- Exponential retry with jitter for failed AI batches

### AI

- Google Vertex AI Gemini API
- Structured output with `responseMimeType: application/json` and `responseSchema`
- Default model target: `gemini-2.5-flash`
- Keep `store: false` for API calls where supported.
- Prompt should focus on extraction rules, allowed enums, skip logic, and note-merging behavior.

### Testing

- Vitest for unit tests.
- React Testing Library for key UI states.
- Supertest for Express API tests.
- Fixture CSV files for Facebook-style, Google Ads-style, real estate, sales report, and messy manual sheets.
- Playwright for one browser smoke test if time allows.

### Deployment

- Web: Vercel.
- API: Railway or Render.
- Docker setup: root `Dockerfile.frontend`, `Dockerfile.backend`, `docker-compose.yml`, and `.dockerignore`.
- Render API Blueprint: root `render.yaml` using the backend Dockerfile.
- Keep the backend stateless for the first version.
- Optional database later only if import history or user auth becomes required.

### Environment Variables

- `LLM_PROVIDER`
- `VERTEX_PROJECT_ID`
- `VERTEX_LOCATION`
- `VERTEX_MODEL`
- `MAX_UPLOAD_MB`
- `AI_BATCH_SIZE`
- `AI_BATCH_CONCURRENCY`
- `CORS_ORIGIN`

Do not expose API keys to the browser. Do not commit `.env` files.

## Architecture Notes

- The frontend parses CSV locally for preview so the user can inspect data before AI processing.
- The backend reparses the uploaded CSV after confirmation. Browser preview data must not be trusted as the source of truth.
- AI extraction runs in batches to reduce token size and isolate failures.
- Each batch returns structured JSON and then passes through Zod validation.
- Failed batches retry before marking affected rows errored due to AI failure.
- Rows omitted by the extractor are treated as errored, not skipped, because omission means the pipeline contract failed.
- Dates must be convertible by JavaScript `new Date(created_at)`.
- Multiple emails or phone numbers should keep the first value in the canonical field and append the rest to `crm_note`.
- CSV output or downloadable samples must avoid unintended line breaks and account for CSV formula injection risks.

## Security Notes

- Lead CSVs contain PII: names, emails, phone numbers, locations, notes.
- Do not log raw row data or raw AI prompts in production.
- Validate file type, size, and parse errors.
- Reject non-CSV uploads.
- Keep AI keys server-side only.
- Add CORS restrictions for the deployed frontend origin.
- Sanitize any future CSV exports against spreadsheet formula injection.

## Initial Implementation Plan

1. Scaffold monorepo and shared TypeScript config.
2. Build shared Zod schemas for CRM records, skipped records, and API responses.
3. Build Express API with `/health` and `/api/imports/extract`.
4. Add CSV parsing, row normalization helpers, AI batch extraction, validation, retry, and summary output.
5. Build Next.js app shell and GrowEasy-style sidebar.
6. Build import modal with upload and preview states.
7. Build result tables, skipped rows, totals, and progress states.
8. Add fixtures and focused tests.
9. Add README setup/deploy instructions.
10. Run lint, typecheck, tests, build, and browser smoke test before submission.

## Change Log

### 2026-07-07

- Created project context from assignment research and user-provided reference screenshots.
- Locked initial tech stack and architecture direction.
- Added rule that this file must be updated whenever implementation decisions or behavior change.
- Started a TypeScript monorepo, then restructured it to the required `Frontend` and `Backend` top-level folders.
- Shared CRM contracts now live in `Backend/shared`; app packages use local `file:` dependencies because the available npm build rejected the `workspace:*` protocol.
- Added shared Zod contracts for CRM records, skipped records, batch diagnostics, and import responses.
- Added an Express API plan with CSV upload validation, server-side CSV parsing, batched AI extraction, local fallback extraction, Zod validation, and no raw PII logging.
- Added a Next.js UI plan matching GrowEasy references: sidebar shell, Lead Sources workspace, CSV upload modal, browser preview before confirmation, processing state, result tables, and diagnostics.
- Implemented the monorepo with:
  - `Backend/shared` CRM constants, Zod schemas, and API response types.
  - `Backend` Express endpoints, upload guards, CSV parsing, Vertex structured-output extraction, fallback extraction, retry diagnostics, and tests.
- Switched LLM provider from OpenAI to Google Vertex AI using `LLM_PROVIDER=vertex` and `VERTEX_PROJECT_ID=alien-slice-499511-f8`.
- Added `Backend/.env` for local Vertex configuration:
  - `LLM_PROVIDER=vertex`
  - `VERTEX_PROJECT_ID=alien-slice-499511-f8`
  - `VERTEX_LOCATION=global`
  - `VERTEX_MODEL=gemini-2.5-flash`
- Replaced the OpenAI SDK dependency with `@google/genai`.
- Added a provider layer under `Backend/src/features/imports/ai/` for Vertex and local fallback extraction.
- Verified local Google ADC is available and live Vertex CSV extraction succeeds with `aiProvider: "vertex"`.
- Fixed duplicate canonical phone/email handling so repeated contact values are not appended to `crm_note`.
- Simplified the frontend to remove demo-only UI:
  - Sidebar now contains only `Lead Sources` and `Manage Leads`.
  - Removed starter/demo lead rows, active-source cards, single-lead card, search/refresh controls, and import diagnostics panel.
  - Main screen now focuses on CSV import plus the Manage Leads results table.
- Fixed browser upload `Failed to fetch` caused by CORS origin mismatch:
  - Next.js runs at `http://127.0.0.1:3000`.
  - API previously allowed only `http://localhost:3000`.
  - `CORS_ORIGIN` now allows both `http://localhost:3000` and `http://127.0.0.1:3000`.
  - Verified preflight and multipart upload from `Origin: http://127.0.0.1:3000`.
- Investigated `extract` returning `500` in the browser network panel:
  - Added non-PII server logging for unexpected API errors with request id, error name, and message.
  - Improved frontend network failure messaging when `fetch` fails before an API response.
  - Fixed phone normalization so date strings such as `2026-06-29T10:00:00.000Z` are not treated as mobile numbers.
  - Fixed contact normalization so `lead_owner` emails are preserved in `lead_owner` and are not appended to `crm_note` as extra lead emails.
  - Added a regression test for the `lead_owner` email case shown in the Manage Leads table.
  - Verified multipart uploads from `Origin: http://127.0.0.1:3000` return `200` with Vertex extraction.
  - Reworked the web UI into a cleaner feature-focused Lead Sources intake section and Manage Leads review section.
  - Fixed the left sidebar so `Lead Sources` and `Manage Leads` are real hash navigation links with active state instead of inert buttons.
  - Added a responsive mobile navigation rail for the same two primary sections.
  - Added lead-name row actions in Manage Leads; selecting a lead opens a tabbed detail panel with Overview, Contact, and CRM tabs.
  - Added focused UI tests for Manage Leads navigation, lead-name selection, and detail tab switching.
  - Added a Next.js app icon so `/icon.svg` resolves and the browser no longer logs a missing favicon request.
  - Removed extra idle pipeline/status UI from the sidebar and Lead Sources header.
  - Changed the Lead Sources import entry from a full-card button into a static panel with an explicit `Upload CSV` action.
  - Made Lead Sources the only CSV upload entry point; Manage Leads empty state is now informational only.
  - Changed successful confirmed CSV upload to navigate to `#manage-leads` with real hash navigation so the sidebar/mobile nav active state updates.
  - `Frontend` Next.js dashboard UI, sidebar, CSV drop zone, local preview, confirm/upload flow, result tables, and tests.
- Restructured the repository to the requested two-folder boundary:
  - `Frontend` contains the complete Next.js application.
  - `Backend` contains the Express API.
  - `Backend/shared` contains shared CRM schemas, constants, and types used by both apps.
- Restructured the repository again to the requested three-folder root:
  - `Frontend`
  - `Backend`
  - `Docs`
  - No root-level app/config/package files remain.
  - `Docs/package.json` now orchestrates setup, dev, typecheck, lint, tests, build, and production audit commands.
- Updated the visual system from the latest reference:
  - Solid GrowEasy teal field `#276159`.
  - White rounded application console.
  - Orange `#F57141` reserved for final import/progress emphasis.
  - Slim icon rail on desktop with only Lead Sources and Manage Leads destinations.
  - Mobile nav keeps the same two destinations visible.
- Moved environment examples into their owning folders:
  - `Backend/.env.example` for API, upload, CORS, and Vertex configuration.
  - `Frontend/.env.example` for `NEXT_PUBLIC_API_URL`.
- Updated `README.md` and `ARCHITECTURE.md` to remove the old `apps/*` and `packages/*` structure.
- Regenerated package lockfiles so dependency paths resolve to `Frontend`, `Backend`, `Backend/shared`, and `Docs`.
- Upgraded `concurrently` to `9.2.3` to remove the critical `shell-quote` dev dependency advisory.
- Current audit status:
  - No high or critical production advisories with `npm --prefix Docs run audit:prod`.
  - Frontend and Docs full audits are clean.
  - Backend and Backend/shared full audits still report one low dev-tooling `esbuild@0.27.7` advisory through `tsup` tooling.
- Added `README.md` with setup, API, env vars, verification commands, and deployment notes.
- Added `ARCHITECTURE.md` with a Mermaid architecture diagram, module boundaries, data contract, security boundaries, and failure handling.
- Verification completed during implementation:
  - `npm --prefix Docs run typecheck`
  - `npm --prefix Docs run lint`
  - `npm --prefix Docs run test`
  - `npm --prefix Docs run build`
- Final verification after restructuring:
  - `npm --prefix Docs run typecheck`
  - `npm --prefix Docs run lint`
  - `npm --prefix Docs run test` - 14 tests passed
  - `npm --prefix Docs run build`
  - `npm --prefix Docs run audit:prod`
  - Playwright Chrome smoke test for CSV upload, confirmed import, Manage Leads redirect, record rendering, and lead detail tabs.
- Final UI/repo-shape verification after latest reference update:
  - Root folder scan returns only `Backend`, `Docs`, and `Frontend`.
  - `npm --prefix Docs run typecheck`
  - `npm --prefix Docs run lint`
  - `npm --prefix Docs run test` - 14 tests passed
  - `npm --prefix Docs run build`
  - `npm --prefix Docs run audit:prod`
  - Playwright Chrome smoke test passed and screenshot captured at `/tmp/groweasy-refreshed-ui.png`.
- Removed the teal/green page background after user feedback:
  - Body/app background is now white/off-white instead of the solid `#276159` field.
  - `#276159` remains only as the brand/action teal.
  - Navigation now uses the provided GrowEasy WebP logo from `Frontend/src/assets/groweasy-logo.webp`.
  - Explicit `next/image` dimensions were added so Vitest and Next builds both resolve the WebP safely.
  - Cleared stale Next cache after a Turbopack dev panic caused by the prior asset path.
  - Reverified with `npm --prefix Docs run typecheck`, `npm --prefix Docs run lint`, `npm --prefix Docs run test`, and `npm --prefix Docs run build`.
  - Browser check confirmed `bodyBackground: rgb(255, 255, 255)` and three rendered logo images; screenshot saved at `/tmp/groweasy-white-bg-logo.png`.
- Browser smoke screenshots were captured for desktop and mobile with Playwright.
- Fixed mobile horizontal overflow by constraining table/grid containers with `min-w-0`.
- Fixed a fallback extractor alias bug where the `Name` column could be incorrectly treated as `company`.
- Live API multipart upload smoke test confirmed 1 imported record and 1 skipped record with local fallback extraction.
- Implemented production-guide hardening:
  - Shared API response now has first-class `errored` rows and `summary.errored`.
  - Backend failed AI batches and missing extractor outcomes are reported as errored, while missing contact info remains skipped.
  - Batch diagnostics now include deterministic row-range IDs such as `rows-2-26` for tracing retries without logging raw PII.
  - Browser and server CSV parsers now detect comma/semicolon/tab delimiters, handle BOM/Latin-1 text, and block duplicate or empty headers before extraction.
  - Vertex requests include per-batch headers, and the prompt requires each row to appear exactly once in imported or skipped output.
  - Manage Leads now shows Total/Imported/Skipped/Errored summary cards, skipped/errored tables, skipped/errored CSV downloads, and a positive empty state when nothing is skipped.
  - Added focused tests for CSV delimiter/header edge cases and local preview parsing.
  - Updated `Docs/package.json` so `typecheck` rebuilds `Backend/shared` before checking dependent packages.
  - Reverified with `npm --prefix Docs run typecheck`, `npm --prefix Docs run lint`, `npm --prefix Docs run test` (21 tests), `npm --prefix Docs run build`, and `npm --prefix Docs run audit:prod`.
  - Live Vertex API smoke with a semicolon CSV from `Origin: http://127.0.0.1:3000` returned 1 imported, 1 skipped, 0 errored rows, and deterministic `batchId: "rows-2-3"`.
- Applied the expanded production UI guide:
  - Import modal now shows a persistent Upload / Preview / Confirm / Process stepper with compact mobile step text.
  - Confirmation actions are pinned in a sticky footer without extra helper copy.
  - Drag-and-drop now rejects multi-file drops with a specific message and visually distinguishes invalid dragged files.
  - Browser preview parsing uses Papa Parse step callbacks and updates row-count progress while parsing.
  - Manage Leads now includes outcome filters for All, Imported, Skipped, and Errored views.
  - Manage Leads now uses the full workspace width instead of a centered outer card, removes provider-specific extraction copy from the heading area, and lets the records table span the full review panel by default; the two-column table/detail layout is only used after a lead is selected.
  - Manage Leads includes a CRM review toolbar with full-record search plus filters for created date, city, state, country, and CRM status; controls filter imported CRM records without changing import summary totals.
  - Confirmed import completion surfaces through one app-level toast after extraction finishes; result filter tabs do not trigger additional "Imported rows", "Nothing skipped", or "Nothing errored" toasts. CSV/API failures still surface through app-level toast notifications.
  - Frontend copy is now provider-neutral: upload, processing, and Manage Leads text should say AI/extraction/processing without naming the underlying model provider.
  - CSV Preview and Manage Leads tables show every available column and row through virtualized scroll containers; no CSV headers are hidden and no preview rows are hidden behind pagination.
  - App shell now includes a persisted dark mode toggle with dark-mode design tokens.
  - Docker deployment assets were added for frontend/backend images, local compose runs, and Render API deployment via `render.yaml`.
- Applied `Docs/references/groweasy_lead_import_redesign.html` as a UI reference:
  - Global tokens now use the warm off-white surface, quieter beige borders, and reference-inspired heading/mono typography.
  - Desktop sidebar is a slimmer icon rail with compact active states.
  - Lead Sources now includes a page-level Upload / Preview / Confirm / Extract pipeline tracker.
  - Import card now includes example column-mapping chips such as `full_name -> name`.
  - Drop zone and result cards use the reference's tighter radius, spacing, and data-product density.
  - Default upload cap is now 10MB in shared constants, backend example env, frontend validation, and docs.
  - Moved the reference HTML into `Docs/references/` so the project root still contains only `Backend`, `Docs`, and `Frontend`.
- Aligned the UI with the live `https://groweasy.ai/` brand direction:
  - Global tokens use a white/off-white canvas, GrowEasy teal `#276159`, and reference-led typography.
  - Preserved orange `#F57141` for the final confirmed import action.
  - Updated upload, modal, and empty-state copy to read as GrowEasy CRM intake rather than generic CSV tooling.
  - Moved exported screen reference HTML files into `Docs/references/` so the project root contains only `Backend`, `Docs`, and `Frontend`.
- Re-applied `Docs/references/groweasy_lead_sources_screen.html` and `Docs/references/groweasy_manage_leads_screen.html` as the two-screen UI reference without copying mock data:
  - Lead Sources keeps the reference-style CRM console surface but is now a clean upload-only destination with one `Upload CSV` action.
  - Manage Leads now always shows reference-style Total/Imported/Skipped/Errored cards and filter tabs, with values derived from `result.summary`.
  - The Manage Leads source line uses the actual uploaded CSV filename, import timestamp, preview row count, and preview column count from frontend state.
  - Static mock counts, fake filenames, and fake lead rows from the HTML references are not used.
  - Table and badge primitives were tightened to match the compact CRM-console reference density.
  - Lead Sources and Manage Leads now render as separate sidebar/hash destinations instead of stacked sections on one page.
  - Successful confirmed CSV import switches the active destination to `#manage-leads`.
  - Removed the duplicate page-level `Upload / Preview / Confirm / Extract` tracker from Lead Sources; the modal is now the only place that shows import progress.
  - Simplified Lead Sources to a single `Upload CSV` action with short process notes for local preview, explicit confirmation, and Manage Leads output.
- Expanded Lead Sources so it no longer feels empty:
  - Reworked the first viewport into an organized stacked intake surface with one focused full-width import band.
  - Removed page-level demo metrics and demo CSV download actions so the screen stays upload-first.
  - Removed the extra `Header intelligence` / `GrowEasy CRM output` mapping panel so Lead Sources stays focused on upload.
- Removed the Lead Sources `Flexible import coverage` / `Works with messy lead exports` source-list panel after user feedback; backend support and regression tests for messy export formats remain in place.
- Replaced the modal CSV preview with a bounded scrollable table:
  - Shows file stats and renders every parsed CSV column and row, regardless of file shape.
  - Preview stats now show the actual visible row count such as `2 of 2` or `100 of 100` instead of the confusing `50 / page` label.
  - Pagination controls are not used; vertical and horizontal scroll handle large row/column counts.
  - Scrollable CSV preview, result tables, modal body, and result tabs hide native scrollbar chrome while preserving vertical and horizontal scrolling.
  - Keeps overflow contained inside the preview table so the modal footer remains usable.
  - Keeps the "No data has been sent anywhere yet" safety state before confirmation.
- Replaced the header-only `Download Sample CSV Template` action with `Download Sample CSV`, backed by the company-provided `groweasy_sample_leads.csv` data rows.
- Kept the modal-only `Download 100 Rows CSV` action backed by generated demo rows.
- Replaced the custom upload drop zone with Aceternity `FileUpload`, keeping the same CSV-only validation and local preview flow.
- Restyled the Aceternity uploader for the white GrowEasy modal: removed the dark demo grid/tile, reduced the upload surface height, and kept a subtle teal dashed target.
- Removed the Aceternity hover/lift animation from the uploader so the white modal stays calm and static.
- Simplified the upload modal empty state into one compact dashed upload surface, a thin helper strip, and non-wrapping CSV download actions.
- Strengthened deterministic fallback mapping for common export headers such as `created_time`, `customer phone`, `campaign_name`, `deal stage`, `assigned agent`, `property type`, `UTM Source`, `First Name`, and `Last Name`.
- Added backend regression coverage proving Facebook Lead Export, Google Ads Export, Excel sheets, Real Estate CRM exports, Sales reports, Marketing agency CSVs, and manually created spreadsheets normalize into GrowEasy CRM fields.
- Replaced the fixed desktop icon rail with an Aceternity-style collapsible sidebar primitive:
  - Added `Frontend/src/components/ui/sidebar.tsx` with `Sidebar`, `SidebarBody`, and `SidebarLink` exports.
  - Kept only GrowEasy product navigation: `Lead Sources` and `Manage Leads`.
  - Reused the existing GrowEasy logo asset and avoided the demo Dashboard/Profile/Settings/Logout links from the reference snippet.
  - Removed the bottom `GE / GrowEasy CRM` profile-style link and smoothed hover expansion with an explicit width transition plus animated logo/link labels.
  - Made the desktop sidebar `sticky top-0` and removed internal nav scrolling so it stays fixed while main content scrolls.
  - Tightened desktop sidebar spacing: smaller nav offset, smaller item gap, shorter link height, and reduced icon-label gap.
  - Added root body hydration-warning suppression for browser-extension-injected attributes such as `cz-shortcut-listen`.
- Fixed dark/light mode behavior and icon placement:
  - `ThemeProvider` now reads saved/system preference before persisting, so a saved dark theme is not overwritten by the initial light render.
  - Added a local Magic UI-style `AnimatedThemeToggler` at `Frontend/src/components/ui/animated-theme-toggler.tsx` using a circle View Transitions reveal where supported and a normal theme switch fallback elsewhere.
  - The desktop theme icon now lives in the sidebar's bottom utility area; mobile keeps the toggle in the header.
  - Added focused tests for saved dark-mode initialization and the animated circle theme toggle.
  - Dark mode now uses explicit control/accent contrast tokens (`--control-active`, `--control-active-foreground`, `--on-teal`, `--on-orange`) so active tabs, sidebar items, and buttons do not reuse foreground text color as a background.
  - Removed hardcoded light modal border styling so import modal surfaces use theme tokens in both light and dark modes.
- Replaced the root `README.md` with a complete project README:
  - Documents product flow, exact tech stack, frontend/backend architecture, data contract, setup, env vars, Docker, deployment, API shape, testing, and security notes.
  - Keeps `Docs/README.md`, `Docs/ARCHITECTURE.md`, and `Docs/Context.md` as deeper references instead of making the root README a thin pointer.
- Fixed Render Docker build packaging:
  - `Dockerfile.backend` and `Dockerfile.frontend` now copy `Docs/tsconfig.base.json` before building `Backend/shared`.
  - This keeps the image build aligned with local TypeScript config inheritance and prevents Render from failing during declaration generation with missing `/app/Docs/tsconfig.base.json`.
- Updated theme initialization:
  - First-time visitors now default to light mode even if their system preference is dark.
  - Saved `groweasy-theme` values still take precedence, so users who manually switch to dark keep dark mode on future visits.

## Context Maintenance Rule

Whenever we make a meaningful project change, update this file in the same work session.

Update this file when:

- Tech stack changes.
- API shape changes.
- Data schema changes.
- UI flow changes.
- Deployment approach changes.
- Security assumptions change.
- A known limitation or blocker appears.
- Tests, fixtures, or verification strategy changes.
