# Repository Guidelines

## Project Structure & Module Organization

- `src/app/` contains Next.js App Router routes and layouts.
- `convex/` contains Convex functions, schema, auth config, and HTTP routes.
- `src/components/` holds UI and feature components (kebab-case filenames, PascalCase exports).
- `src/lib/` provides shared utilities (helpers, validators).
- `src/hooks/` contains reusable hooks (Convex auth, etc.).
- `src/stores/` contains Zustand state stores.
- `public/` stores static assets served by Next.js.

## Build, Test, and Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Run local dev server at http://localhost:3000
npx convex dev       # Run Convex dev backend + generate types
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint (Next.js + TS rules)
npx convex deploy    # Deploy Convex functions to production
npm run import-data  # Import demo data into Convex
```

## Coding Style & Naming Conventions

- TypeScript is strict (`tsconfig.json`); avoid `any` and prefer explicit types.
- Use 2-space indentation and semicolons, matching existing files.
- Use `@/*` path aliases (e.g., `@/lib/utils`) instead of relative deep paths.
- Keep Tailwind utility classes readable and grouped by layout → spacing → color when editing UI.

## Testing Guidelines

- No automated test runner is configured in this repo.
- Use `npm run lint` plus manual UI checks for changes.
- If you introduce tests, prefer `*.test.ts`/`*.test.tsx` naming and document the runner in this file.

## Commit & Pull Request Guidelines

- Commit messages follow Conventional Commits (e.g., `feat: add budget copy action`).
- Keep commits small and scoped; one logical change per commit when possible.
- PRs should include a brief summary, linked issues (if any), and screenshots for UI changes.

## Security & Configuration Tips

- Store Convex public settings in `.env.local` (`NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOYMENT`).
- Configure `SITE_URL`, `JWT_PRIVATE_KEY`, `JWKS`, `RESEND_SMTP_PASSWORD`, and `RESEND_FROM_EMAIL` via `npx convex env set` (not in git).
- Never commit secrets or production credentials.
- For local data refreshes, prefer `npm run import-data` over manual edits.
