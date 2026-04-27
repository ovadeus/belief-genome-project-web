# Overview

This project is a full-stack website for the "Belief Genome Project," a psychometric self-knowledge framework, which also includes a desktop application and a book. The platform aims to provide users with tools to map and understand their beliefs through an interactive system, while also offering public resources like a blog and information about the project. The business vision is to establish a leading platform for psychometric self-discovery, leveraging a unique belief-mapping framework to foster self-awareness and personal growth. The project ambitiously seeks to expand into a comprehensive ecosystem including web, desktop, and print media, targeting individuals seeking deeper self-understanding and researchers in psychology and sociology.

# User Preferences

I want iterative development.
I prefer to be asked before you make any major changes to the codebase.
I like to be given a detailed explanation of the changes that are being made to the codebase.
I prefer clear and concise communication.
I want to be kept informed about the progress of the project.
Do not make changes to files in the `lib/belief-engine` directory without explicit instruction.

# System Architecture

The project utilizes a pnpm workspace monorepo with TypeScript, Node.js 24, and pnpm. The monorepo is structured into `artifacts` (deployable applications like `api-server`, `whoo-ru` frontend, `genome-app`, `entropy-harvester`, and `mockup-sandbox`) and `lib` (shared libraries such as `api-spec`, `api-client-react`, `api-zod`, `db`, and `belief-engine`).

**Entropy Harvester (`artifacts/entropy-harvester`, served at `/entropy-harvester/`):** A separate commercial product (BGPanalytics.com) being built in phases per `attached_assets/EntropyHarvester-Replit-PromptSheet-v1.3.md`. Mirrors `whoo-ru`'s package shape, vite config, and Tailwind v4 token system (including the `--color-belief-*` identity palette). Phase 0 (complete): empty artifact registered, dark-theme placeholder route at `/` with the locked tagline "A survey instrument that preserves superposition." Phases 1–7 will add `eh_*` Drizzle tables, `/api/eh/*` routes on the existing `api-server`, JWT cookie auth (`eh_token`), Stripe billing (Researcher/Pro plans), the marketing site, and the authenticated harvester surface. Locked product decisions: do NOT modify `lib/belief-engine`, do NOT fork `api-server`, do NOT introduce new color tokens beyond the existing palette.

**UI/UX Design:**
The frontend, `whoo-ru`, is built with React 19, Vite, Tailwind CSS, and wouter for routing. It features a dark premium aesthetic with a custom color palette (`#0a0a0f` background, `#6c8fff` electric blue primary, `#a78bfa` violet, `#22d3ee` cyan). A politically neutral belief spectrum uses `#35E4CF` (green), `#FFFFFF` (white), and `#52A8FF` (blue). The primary fonts are Space Grotesk (display) and Inter (body). Key visual elements include a CSS animated triple helix in the hero section and frosted glass styling for genome-related panels.

**Technical Implementations & Feature Specifications:**

*   **API Server (`api-server`):** An Express 5 server handling API routes for authentication (JWT cookie-based), blog CRUD, subscriber/early bird management, and genome user interactions.
*   **Database:** PostgreSQL with Drizzle ORM is used for data persistence.
*   **Frontend (`whoo-ru`):**
    *   **Public Pages:** Include Home, About, Blog, App, Book, Subscribe, Explore Beliefs (public visualization of aggregated anonymous belief data), Privacy Policy, Terms of Service, and Support.
    *   **Admin Panel (`/admin/*`):** Secure, JWT cookie-based authentication with features for dashboard, blog post CRUD (Markdown editor), media library, subscriber/early bird management, genome data management, analytics (page views, visitors), and site settings.
    *   **Belief Genome Feature (now in standalone `genome-app` artifact):** As of v2.4 the authenticated psychometric web app lives in its own artifact (`artifacts/genome-app`) and is intended to be served at `app.beliefgenomeproject.org`. Routes are mounted at the root: `/login`, `/register`, `/probe`, `/dashboard`, `/dna`, `/dna/:signature` (public share page — must be declared before `/dna` because wouter matches in order), `/analyze`, `/sync`, `/profile`.
        *   **Per-User DNA Library + Compare (Phase 3.5, Sprint 1):** Engine extended with `buildBgpFile`, `parseBgpFile`, `parseSignatureFromAnyInput`, and `BGP_FORMAT='bgp-dna/v1'` so any UI can hand the engine raw text (file contents, pasted signature, share URL) and get back a structured `ParsedSignatureInput`. New `known_dnas` table stores per-user library entries with composite uniqueness on `(user_id, signature)` — server upserts on conflict and every read/write/delete filters on `req.user.id`. `dna_share_events` extended with `signature_b` column and a new `'compare_view'` analytics kind for the public compare URL. Routes: `GET/POST/DELETE /api/genome/known-dnas` (auth, 60/min/user) plus `POST /api/genome/known-dnas/parse` for any-shape input validation; `GET /api/genome/compare?against=<idOrSignature>` (auth) returns the full `{yours, theirs, comparison}` payload using a single source of truth in `compareService.ts` (bucket thresholds: ≤1 strong, ≤3 mild, ≤5 moderate, else strong_diff); `GET /api/genome/dna/public/compare/:sigA/:sigB` is the public unauth analog and never leaks which side failed. Privacy: `theirs.demographics` is forcibly nulled server-side for anonymous signatures (defense in depth on top of the engine slice). Client-side `.bgp` export ships as `ExportBgpModal` (sibling of `ShareDnaModal`, identical privacy posture — anonymous default, signed mode requires explicit acknowledgement, optional shareable name pre-filled from profile) and writes `belief-dna-YYYY-MM-DD[-signed].bgp` via Blob+ObjectURL, no new dependencies. Sprints 2 (library page + import flow), 3 (CompareView component), and 4 (PublicComparePage + share CTAs) pending.
        *   **DNA Share/Export (Phase 3):** From the authenticated `/dna` page, users can Share their DNA via a privacy-first modal (defaults to Anonymous mode which encodes only the 124 belief scores; Signed mode embeds demographics and is gated behind an explicit checkbox-confirmed warning). Share links use raw signature format `a:<124>-<crc>` for anonymous and `s:<140>-<crc>` for signed, both with a 4-char FNV-1a checksum. Signature codec lives in `@belief-genome/engine` (`dnaSignature.ts`) — anonymous encoder slices the belief segment internally so callers cannot accidentally leak demographics. The public `/dna/:signature` page hits `/api/genome/dna/public/:signature` (CORS-enabled, unauthenticated, mounted **before** the auth-gated `/genome` subrouter so the auth middleware doesn't intercept it). Public dimension catalog at `/api/genome/dna/public/dimensions`. Rate limit: 30 req/min/IP via `express-rate-limit`; `app.set('trust proxy', 1)` ensures correct per-IP keying behind Replit's proxy. Analytics persisted to `dna_share_events` table with `kind: 'view' | 'share_click'` and salted-IP hashes (`sha256(ip + IP_HASH_SALT)`, truncated to 64 hex chars; salt is server-side, requires `IP_HASH_SALT` env var, falls back to per-process random in dev). A "Download PNG" button on `/dna` renders only the `DnaStrip` element via `html-to-image` (dynamic import) so demographics text is never captured. Static OG meta with a generic share card lives in `index.html` + `public/og-default.png`; per-DNA dynamic OG images deferred. The marketing site no longer ships any genome React code; legacy `/genome/*` URLs are redirected to the standalone app via `VITE_GENOME_APP_URL` (defaults to `/genome-app/` in dev). The genome app talks to the same `api-server` and resolves the API base via `VITE_API_URL` (empty in dev = same-origin, set to e.g. `https://api.beliefgenomeproject.org` in prod). For prod cross-subdomain CORS, set `ALLOWED_ORIGINS` on the api-server to a comma-separated list including the genome subdomain.
        *   **Auth:** Separate user authentication with `GENOME_JWT_SECRET`.
        *   **Core Interactions:** User registration/login, Reflections (answering belief probes), Dashboard (personalized with various visualizations like DNA Strip, Triple Helix, Neuromap, Radar), Belief DNA viewer, Analyze (DNA rebuild), Sync Data, and Profile management.
        *   **Neuromap:** A public shareable 3D neural belief map (`bgp_brain_3d.html` via `postMessage`).
        *   **GenomeNav:** A sticky navigation bar for authenticated genome pages.
        *   **Harmonize DNA (Easter egg, v2):** Hidden audio playback of the user's full 124-cell DNA strip. Trigger is intentionally undocumented for social-media discovery: type the letters `B → G → P` in sequence within ~1.2 seconds anywhere on the dashboard (suppressed inside form inputs, with modifier keys held, or during IME composition). Toggles play/stop. Audio engine in `genome-app/src/lib/harmonize/` is React-free for desktop port reuse: `harmonizer.ts` (orchestration), `musicbox-synth.ts` (signal chain), `bed-arrangement.ts` (DNA-derived chord progression), `reverb-ir.ts` (synthesized hall impulse for ConvolverNode — no audio assets shipped), `sequence.ts` + `pitch-map.ts` (per-cell C-major-pentatonic notes). Layered playback: a slow chord pad bed whose mode (Lydian / Ionian / Aeolian) is picked from the user's global belief centroid and whose chord per region is driven by each category's confidence-weighted average score, with per-cell triangle+sine notes layered on top as "sparkle." A dedicated `bedDuck` gain stage sidechains the bed under each note onset (~250ms dip) without colliding with the bed's long-form fade automation. Adjacent bed regions truly crossfade by overlapping in time. Two stop profiles: `'user'` (~800ms gentle fade on toggle-off) and `'natural'` (~1.2s bed ease + ~2s reverb tail at end of sequence). Total runtime ~24-32s for 124 cells at `cellMs=240`. React adapter `hooks/use-harmonize.ts`; key-sequence detector `hooks/use-bgp-easter-egg.ts`; component-level toggle wired via window `CustomEvent('bgp:harmonize-toggle')` so DnaStrip stays decoupled from the trigger.
*   **Belief Engine (`@belief-genome/engine`):** A pure TypeScript domain logic package defining the 128-dimension framework, probe bank, DNA string calculation, and DNA prefix structure. It also includes `probeFeeds.ts` for AI-classified belief probes from RSS feeds.
*   **API Codegen:** Orval generates API client code (React Query hooks) and Zod schemas from an OpenAPI specification (`api-spec`).
*   **Monorepo Tooling:** pnpm workspaces with TypeScript composite projects ensure consistent type-checking and dependency management across packages.
*   **Security:** Implemented CORS with exact origin matching, `postMessage` for Neuromap with `targetOrigin` validation, and test data isolation flags for public visualizations. Database indexes are applied for performance on key `genome_submissions` fields.

# External Dependencies

*   **API Framework:** Express 5
*   **Database:** PostgreSQL
*   **ORM:** Drizzle ORM
*   **Frontend Framework:** React 19
*   **Build Tool:** Vite (for frontend)
*   **Styling:** Tailwind CSS
*   **Routing:** wouter (for frontend)
*   **Data Fetching:** `@tanstack/react-query`
*   **Form Management:** `react-hook-form`
*   **Validation:** Zod (`zod/v4`), `drizzle-zod`
*   **Animations:** `framer-motion`
*   **Date Utilities:** `date-fns`
*   **Authentication:** `bcryptjs`, `jsonwebtoken`
*   **Charting:** `chart.js`, `react-chartjs-2`
*   **Icon Library:** Lucide icons
*   **API Codegen:** Orval
*   **Rate Limiting:** `express-rate-limit`
*   **AI Integration:** OpenAI API (for `probeFeeds.ts`)