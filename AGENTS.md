# Repository Guidelines

## Project Structure & Module Organization

- `src/app/` contains Next.js App Router routes, layouts, and server actions.
- `src/components/` holds UI and feature components (kebab-case filenames, PascalCase exports).
- `src/lib/` provides shared utilities (Supabase clients, Prisma client, helpers, validators).
- `src/stores/` contains Zustand state stores.
- `prisma/` includes the schema and `seed.mjs` for database seeding.
- `public/` stores static assets served by Next.js.

## Build, Test, and Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Run local dev server at http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint (Next.js + TS rules)
npx prisma generate  # Generate Prisma client
npx prisma migrate dev  # Run local migrations
npm run seed         # Seed demo data (requires SEED_* env vars)
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

- Store Supabase public settings in `.env.local` and database URLs in `.env`.
- Never commit secrets or production credentials.
- For local DB resets, prefer migrations + `npm run seed` over manual edits.
