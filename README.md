# ʻŌlelo Noʻeau Search App

A lightweight public search + index for ʻōlelo noʻeau (Hawaiian poetical sayings), with optional member features (favorites + mind map) and simple usage metrics.

## Features

### Public (MVP)
- Browse all phrases by phrase_number (ordered, paginated)
- Search (fast, readable, flexible)
- Filter by Hawaiian letter, English letter, category, tags
- Home page with:
  - About section
  - Daily Pull (phrase + moon phase + Hawaiʻi weather)
  - Submit a poetical phrase (goes to moderation queue)

### Members (small scale; ≤100 users)
- Auth
- Favorites list
- Mind Map / Whiteboard (sticky notes, saved)

### Metrics
- Unique visitor count (privacy-aware)
- Member count

## Tech Stack

- **Next.js** (App Router) + TypeScript
- **Supabase** (Postgres, Auth, RLS)
- **Tailwind CSS** for styling
- **Supabase CLI migrations** (required)

## Setup

### Prerequisites

- Node.js 18+
- Supabase account and project
- Supabase CLI (e.g. `brew install supabase/tap/supabase` or use `npx supabase`)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (Next.js uses `.env.local` for local overrides):
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Supabase credentials in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `IP_HASH_SALT` (generate a random string)

4. Link Supabase (if needed) and run migrations:
   ```bash
   npm run supabase:check   # verify link
   npm run migrate         # applies supabase/migrations/
   ```
   Or run the migration SQL manually in the Supabase dashboard.

5. Import the JSON data:
   ```bash
   npm run import
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
olelo-noeau-search/
├── app/                     # Next.js App Router (pages, layout, API routes)
├── components/              # React components (nav, home, phrase, search, metrics)
├── lib/                     # Utilities (supabase, hawaiian, search, types, scrollUtils, useModalBodyScroll)
├── Scripts/                 # import-json, supabase check/db-report
├── data/                    # JSON source of truth, CSV, tag-category-map
├── supabase/migrations/     # Database migrations
└── docs/                    # Hawaiian language handling
```

## Design System

### Colors
- Background: `#fef9ed`
- Card: `#fef9ed`
- Buttons: `#f7edd9`
- Text: `#261e0d`
- Highlight: `#9cf6f6`

### Typography
- Body text: Lora (regular)
- Navigation: Times
- Headings: Times (bold)
- Links/Mono: Red Hat Mono, 11pt, 400 weight

### Category Colors
- Plants: `#c8ddbb`
- Birds: `#fbdf9d`
- General: `#fbb39d`
- Fish + Aquatic Life: `#b6e2dd`
- Places: `#fba09d`
- Names: `#e9e5af`

## Pre-launch checklist

- [ ] Remove localtunnel bypass: `<script>` in `app/layout.tsx` and `bypass-tunnel-reminder` header in `proxy.ts` before production
- [ ] No secrets in repo (use `.env.local` locally; set env vars in host for production)
- [ ] `npm run build` and `npm run lint` pass
- [ ] Supabase migrations run and data imported

## Important Notes

### JSON is the Source of Truth
- Phrase content is maintained in `data/phrases-with-meta-tags.json`
- Core phrases table must match the JSON fields
- Do not normalize categories/tags into separate core tables unless JSON changes require it

### Hawaiian Language Correctness
- Always use proper diacritics: `ʻŌlelo Noʻeau` (not `Olelo Noeau`)
- Store canonical diacritics in DB (ʻokina/kahakō)
- Accept user input that may contain ',  ', ʼ and normalize for search
- Do not "spellcheck" Hawaiian words

## Documentation

- [Hawaiian Language Handling](./docs/HAWAIIAN_LANGUAGE.md)
- [Data Import](./data/README.md)

## Development

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Importing Data

```bash
npm run import
```

## License

[Add your license here]
