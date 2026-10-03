# EconForAll

EconForAll is a Next.js application for classroom economics simulations. The public experience centers on the Interest Rate and Money Growth games, with a shared leaderboard and protected administration tools. Historical Public Goods and Apple Market routes remain available but are not part of the primary navigation.

## Primary routes

- `/` — application home
- `/inflation` — Interest Rate game
- `/money` — Money Growth game
- `/results` — shared leaderboard
- `/admin` — protected score and player maintenance

## Local development

Copy `.env.local.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (used only by browser polling)
- `NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY` (server only; never expose it with a `NEXT_PUBLIC_` prefix)
- `NEXT_PRIVATE_ADMIN_PASSWORD`

Then run:

```bash
npm ci
npm run dev
```

## Quality checks

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

The protected numerical model is documented in [`docs/ECONOMIC_MODEL.md`](docs/ECONOMIC_MODEL.md) and covered by regression tests in `lib/economic-model.test.ts`. Do not modify its formulas, constants, rounding, scoring, periods, or completion behavior without explicit approval from the model owner.

## Data access

Server components and actions use `lib/supabase/server.ts`. Browser polling uses the singleton public client in `lib/supabase/client.ts`. Historical Supabase types for all four games are intentionally retained in `types/supabase.ts`.
