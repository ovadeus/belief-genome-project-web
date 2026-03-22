# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React 19 + Vite + Tailwind CSS + wouter
- **UI**: Custom dark theme components, Framer Motion, Lucide icons

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (port 8080)
│   ├── whoo-ru/            # React + Vite frontend
│   └── mockup-sandbox/     # Component preview server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── belief-engine/      # Belief Genome domain logic (dimensions, probes, DNA)
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Belief Genome Project

Full-stack website for a psychometric self-knowledge framework, desktop app, and book.

### Design
- Dark premium aesthetic: `#0a0a0f` background, `#6c8fff` electric blue primary, `#a78bfa` violet, `#22d3ee` cyan
- Font: Space Grotesk (display), Inter (body)
- CSS animated triple helix in hero section

### Public Pages
- **Home** (`/`): Hero with triple helix animation, tagline, CTAs
- **About** (`/about`): Founder bio (David Edwin Meyers), origin story, research mission, timeline
- **Blog** (`/blog`): Post listing with search, hashtag filters, pagination
- **Blog Post** (`/blog/:slug`): Full article with sharing, related posts
- **App** (`/app`): Desktop app showcase, features, FAQ accordion, download CTA
- **Book** (`/book`): Book promo with 3D cover, early bird signup, chapter excerpt
- **Subscribe** (`/subscribe`): Newsletter subscription form with benefit cards

### Admin Panel (`/admin/*`)
- **Login** (`/admin/login`): JWT cookie-based auth (separate from genome user auth)
- **Dashboard** (`/admin/dashboard`): Stats cards, recent signups, recent posts
- **Blog Posts** (`/admin/blog`): CRUD list with status toggle
- **Blog Editor** (`/admin/blog/new`, `/admin/blog/edit/:id`): Markdown editor with toolbar
- **Media Library** (`/admin/media`): Upload/browse/delete media via object storage
- **Subscribers** (`/admin/subscribers`): List with search/filter, CSV export
- **Early Bird** (`/admin/earlybird`): List with CSV export
- **Settings** (`/admin/settings`): Site settings, change password

### Admin Credentials
- Username: `admin`, Password: `WhooRU2025!`
- JWT_SECRET set in environment variables

### Belief Genome Feature (`/genome/*`)
Interactive belief mapping system — completely separate auth from admin.
All genome pages wrapped in `GenomeLayout` which provides sticky `GenomeNav` bar + auth guard.

- **Register** (`/genome/register`): Create genome user account (no nav shown)
- **Login** (`/genome/login`): Sign in to genome (no nav shown)
- **Probe** (`/genome/probe`): Answer belief probes (core interaction)
- **Dashboard** (`/genome/dashboard`): 6-tab dashboard — Triple Helix, Radar, Breakdown, Timeline, History, Forecaster
- **Belief DNA** (`/genome/dna`): Full 135-char DNA string viewer with copy button and how-it-works legend
- **Analyze** (`/genome/analyze`): Full DNA rebuild from all responses, shows dimensions covered and confidence
- **Sync Data** (`/genome/sync`): Sync status (Chrome extension, website, desktop counts) + manual sync trigger
- **Profile** (`/genome/profile`): Editable name, gender, DOB, country dropdown (55 countries), zip code, live DNA prefix preview

#### GenomeNav (sticky nav bar on all authenticated genome pages)
Links: Dashboard | DNA | Analyze | Sync Data | Profile | [User Name] | Sign Out

#### Genome Auth
- Separate `users` table, JWT tokens via `GENOME_JWT_SECRET`
- Context: `GenomeAuthProvider` wrapping the app
- API helper: `genomeApi()` for authenticated requests
- Homepage navbar: Sign In / Get Started buttons (or Dashboard + user name + Sign Out when logged in)

#### Belief Engine (`@belief-genome/engine`)
Pure domain logic package with no framework deps:
- `beliefDNA.ts`: 128-dimension framework, DIMENSIONS, CATEGORIES constants
- `probeBank.ts`: 100+ categorized belief probes with dimension weights
- `dnaCalculator.ts`: DNA string builder, dimension value calculator
- `probeFeeds.ts`: RSS news feed → AI-classified belief probes (requires OPENAI_API_KEY)

### Database Tables
- `blogPosts`: Blog content with slug, excerpt, body, hashtags, status
- `subscribers`: Newsletter subscribers with email, name, source
- `earlyBird`: Book early bird signups
- `adminUsers`: Admin accounts with hashed passwords
- `siteSettings`: Key-value site configuration
- `media`: Uploaded file metadata
- `users`: Genome user accounts (email, password, demographics)
- `beliefResponses`: User probe responses with dimension weights
- `probes`: Queued probes per user (bank + news sources)
- `dimensionScores`: Aggregated dimension scores per user
- `dnaSnapshots`: Saved DNA string snapshots

### API Routes (Express, `/api`)
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET/POST /api/blog`, `GET/PUT/DELETE /api/blog/:slug`
- `GET /api/admin/stats`, `GET/POST/PUT/DELETE /api/admin/blog/*`
- `GET/POST/DELETE /api/admin/subscribers/*`
- `GET/POST/DELETE /api/admin/earlybird/*`
- `GET/PUT /api/admin/settings`
- `POST /api/admin/change-password`
- `POST /api/subscribe`, `POST /api/earlybird`
- `POST /api/genome/register`, `POST /api/genome/login`, `POST /api/genome/logout`
- `GET /api/genome/me`, `GET /api/genome/dna`, `GET /api/genome/history`
- `GET/PUT /api/genome/profile`, `GET /api/genome/dimensions`
- `POST /api/genome/snapshot`
- `GET /api/genome/probes/next`, `POST /api/genome/probes/respond`
- `POST /api/genome/analyze` (rebuild all dimension scores from scratch)
- `GET /api/genome/sync/status`, `POST /api/genome/sync` (cross-platform sync)

### Key Dependencies
- `@tanstack/react-query` for data fetching
- `react-hook-form` + `zod` for form validation
- `framer-motion` for animations
- `date-fns` for date formatting
- `bcryptjs`, `jsonwebtoken` for auth
- `chart.js`, `react-chartjs-2` for genome radar/bar charts
- `express-rate-limit` for rate limiting

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only `.d.ts` files during typecheck
- **Project references** — A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build`
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server with JWT cookie-based auth, blog CRUD, subscriber/early bird management, genome user auth and probes.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS (origin-locked), JSON parsing, cookie parser, routes at `/api`
- Routes: auth, blog, admin, subscribers, earlybird, settings, storage, genome-auth, genome-probes, genome-data
- Depends on: `@workspace/db`, `@workspace/api-zod`, `@belief-genome/engine`

### `artifacts/whoo-ru` (`@workspace/whoo-ru`)

React + Vite frontend with dark premium design, wouter routing, React Query hooks.

- Entry: `src/main.tsx`
- Router: `src/App.tsx` with wouter
- Pages: `src/pages/` (public + admin + genome)
- Hooks: `src/hooks/` (use-auth, use-admin, use-blog, use-toast, use-media)
- Layouts: `src/components/layout/` (PublicLayout, AdminLayout)
- Genome: `src/components/genome/` (GenomeAuthContext, genome-utils, RadarChart, BreakdownBars, DnaString, HistoryList, TripleHelix, Timeline, Forecaster, GenomeLayout, GenomeNav)

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

### `lib/belief-engine` (`@belief-genome/engine`)

Pure TypeScript domain logic for the 128-dimension belief mapping system. Shared between API server and frontend.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec and Orval codegen config.

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client.

### `scripts` (`@workspace/scripts`)

Utility scripts. Run via `pnpm --filter @workspace/scripts run <script>`.
- `seed` — seeds database with admin user, sample blog posts, subscribers
