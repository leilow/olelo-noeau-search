# ʻŌlelo Noʻeau Search

Search + index for ʻōlelo noʻeau (Hawaiian poetical sayings). Next.js, Supabase, Tailwind.

## Setup

1. `npm install`
2. `cp .env.local.example .env.local` — add Supabase URL, anon key, service role key, `IP_HASH_SALT`
3. `npx supabase link` then `npm run migrate` (or run migrations in Supabase SQL Editor)
4. `npm run import` — loads `data/phrases-with-meta-tags.json`
5. `npm run dev`

## Deploy

- Set env vars on your host (Vercel, etc.): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `IP_HASH_SALT`
- `npm run build` && `npm start` (or connect repo to host)

**Production: database not loading?**  
1. Vercel → Project → Settings → Environment Variables — all four Supabase vars set for **Production**.  
2. Supabase has data: run `npm run import` locally (your `.env.local` must point to the same Supabase project).  
3. Vercel → Deployments → latest → Logs — check for 500 or "Missing …" env errors.

## Scripts

- `npm run dev` — dev server
- `npm run build` / `npm start` — production
- `npm run import` — import phrases JSON to Supabase
- `npm run migrate` — push Supabase migrations

## Data

Phrase content: `data/phrases-with-meta-tags.json`. Run migrations before import.

Want the database? Email me [your@email.com].
