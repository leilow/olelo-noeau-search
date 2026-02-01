# Phrases Data

`phrases-with-meta-tags.json` is the **source of truth** for phrase content. The database schema mirrors it.

## Import

1. Supabase set up and migrations run (`npm run migrate`).
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
3. Run: `npm run import`

`tag-repeats-review.json` is a reference file (repeated words across tags); not used by the app.
