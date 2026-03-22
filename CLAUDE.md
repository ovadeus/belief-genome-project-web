## CRITICAL: Replit Configuration Files — DO NOT MODIFY OR DELETE
This project is synced with Replit. The following files are managed by Replit
and must NEVER be deleted, overwritten, or modified:

### Never touch these files:
- `.replit` — Replit project configuration (deployment, workflows, artifacts)
- `replit.nix` — Nix environment configuration
- `artifact.toml` — Artifact registry (if present)
- `.replit.app` — Deployment metadata (if present)

### Never touch these directories:
- `.cache/` — Replit cache
- `.config/` — Replit internal config
- `.local/` — Replit agent skills and session data
- `.canvas/` — Replit canvas state

### Git rules:
- NEVER run `git clean -fd` in this repo — it will delete untracked Replit config files
- NEVER force-push to main without confirming Replit files are preserved

### Safe to edit:
- Everything inside `artifacts/` (source code)
- Everything inside `lib/` (shared libraries)
- `package.json`, `pnpm-workspace.yaml`, `tsconfig.json`
- `blog-assets/` (HTML content files)
- `scripts/` (build/deploy scripts)
