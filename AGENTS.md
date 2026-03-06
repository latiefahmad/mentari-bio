# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Rumah Belajar Mentari is an Indonesian tutoring center website with two frontend pages (public site + admin CMS) and a Vercel serverless backend that uses Supabase (PostgreSQL + Storage). See `plans/backend-architecture.md` for full architecture details.

### Running the dev server

- The canonical dev command is `npm run dev` which runs `vercel dev`. This requires Vercel CLI authentication (`vercel login` or `--token`).
- **Known issue:** `vercel dev` triggers a recursive invocation error because `package.json` sets `"dev": "vercel dev"`. The Vercel CLI detects this and refuses to start. Workaround: run `npx serve -l 3000 .` to serve the static frontend files locally (without API route support).
- For the serverless API routes (`/api/*`) to work locally, `vercel dev` must be running with valid Vercel credentials.

### Environment variables

Copy `.env.example` to `.env` and fill in real values. Required secrets:

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |

`JWT_EXPIRES_IN` defaults to `8h` if unset. The Supabase database must have migrations applied from `supabase/migration.sql` and `supabase/events-migration.sql`.

### Lint / Test / Build

- **No lint, test, or build scripts** are configured in `package.json`. The frontend is vanilla HTML/CSS/JS with no build step.
- Syntax-check all JS files: `for f in api/**/*.js lib/*.js; do node -c "$f"; done`
- Verify modules load: `node -e "require('./lib/supabase.js'); require('./lib/auth.js'); require('./lib/cors.js'); require('./lib/rateLimit.js'); require('./lib/image.js'); console.log('All modules OK')"`

### Serving the static frontend without Vercel CLI auth

```sh
npx serve -l 3000 .
```

Do **not** use the `-s` (SPA) flag; it redirects all routes to `index.html`, breaking direct access to `admin.html`.
