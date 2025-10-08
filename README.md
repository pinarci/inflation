# Inflation (Next.js) - Supabase + Vercel setup

This project uses Supabase for database and Vercel for hosting. Below are quick setup steps for local development and a Vercel deployment.

## Environment variables
Create a `.env.local` from the included `.env.local.example` and populate the values from your Supabase project.

- NEXT_PUBLIC_SUPABASE_URL: Supabase project URL (public)
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anon/public key
- NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY: (Optional) Service Role key for trusted server operations — keep this secret and set it only in Vercel (do not commit)

## Local development
1. Copy `.env.local.example` to `.env.local` and fill the keys.
2. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel
1. Push the repository to GitHub (or connect your Git provider).
2. In the Vercel dashboard, create a new project and connect the repo.
3. In Project Settings → Environment Variables, add the following keys (use the exact names):
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY (set only for Production if needed)
4. Deploy. Vercel's build step will run `npm run build`.

## Notes and best practices
- Only use the Service Role key on the server (server actions, API routes). The codebase already uses `process.env.NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY` in some server-only modules.
- For client-side usage, use the public NEXT_PUBLIC keys.
- Consider using Supabase Auth and row-level security in your Supabase project for secure access.
