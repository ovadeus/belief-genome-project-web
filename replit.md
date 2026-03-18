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
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## WhooRU Project

WhooRU is a full-stack website for a self-knowledge framework, desktop app, and book.

### Design
- Dark premium aesthetic: `#0a0a0f` background, `#6c8fff` electric blue primary, `#a78bfa` violet, `#22d3ee` cyan
- Font: Space Grotesk (display), Inter (body)
- CSS animated triple helix in hero section

### Public Pages
- **Home** (`/`): Hero with triple helix animation, tagline, CTAs
- **About** (`/about`): Founder bio, origin story, research mission, development timeline
- **Blog** (`/blog`): Post listing with search, hashtag filters, pagination
- **Blog Post** (`/blog/:slug`): Full article with sharing, related posts
- **App** (`/app`): Desktop app showcase, features, FAQ accordion, download CTA
- **Book** (`/book`): Book promo with 3D cover, early bird signup, chapter excerpt
- **Subscribe** (`/subscribe`): Newsletter subscription form with benefit cards

### Admin Panel (`/admin/*`)
- **Login** (`/admin/login`): JWT cookie-based auth
- **Dashboard** (`/admin/dashboard`): Stats cards, recent signups, recent posts
- **Blog Posts** (`/admin/blog`): CRUD list with status toggle
- **Blog Editor** (`/admin/blog/new`, `/admin/blog/edit/:id`): Markdown editor with toolbar
- **Subscribers** (`/admin/subscribers`): List with search/filter, CSV export
- **Early Bird** (`/admin/earlybird`): List with CSV export
- **Settings** (`/admin/settings`): Site settings, change password

### Admin Credentials
- Username: `admin`, Password: `WhooRU2025!`
- JWT_SECRET set in environment variables

### Database Tables
- `blogPosts`: Blog content with slug, excerpt, body, hashtags, status
- `subscribers`: Newsletter subscribers with email, name, source
- `earlyBird`: Book early bird signups
- `adminUsers`: Admin accounts with hashed passwords
- `siteSettings`: Key-value site configuration

### API Routes (Express, `/api`)
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET/POST /api/blog`, `GET/PUT/DELETE /api/blog/:slug`
- `GET /api/admin/stats`, `GET/POST/PUT/DELETE /api/admin/blog/*`
- `GET/POST/DELETE /api/admin/subscribers/*`
- `GET/POST/DELETE /api/admin/earlybird/*`
- `GET/PUT /api/admin/settings`
- `POST /api/admin/change-password`
- `POST /api/subscribe`, `POST /api/earlybird`

### Key Dependencies
- `@tanstack/react-query` for data fetching
- `react-hook-form` + `zod` for form validation
- `framer-motion` for animations
- `date-fns` for date formatting
- `bcryptjs`, `jsonwebtoken` for auth
- `multer` for file uploads
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

Express 5 API server with JWT cookie-based auth, blog CRUD, subscriber/early bird management, and admin dashboard.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS (origin-locked), JSON parsing, cookie parser, routes at `/api`
- Routes: auth, blog, admin, subscribers, earlybird, settings
- Depends on: `@workspace/db`, `@workspace/api-zod`

### `artifacts/whoo-ru` (`@workspace/whoo-ru`)

React + Vite frontend with dark premium design, wouter routing, React Query hooks.

- Entry: `src/main.tsx`
- Router: `src/App.tsx` with wouter
- Pages: `src/pages/` (public + admin)
- Hooks: `src/hooks/` (use-auth, use-admin, use-blog, use-toast)
- Layouts: `src/components/layout/` (PublicLayout, AdminLayout)

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec and Orval codegen config.

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client.

### `scripts` (`@workspace/scripts`)

Utility scripts. Run via `pnpm --filter @workspace/scripts run <script>`.
- `seed` — seeds database with admin user, sample blog posts, subscribers
