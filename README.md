# 🌺 Ōlelo Noʻeau Search
Search + index for Hawaiian poetical sayings.

## 🚀 Setup
1. `npm install`
2. Set `.env.local`: Supabase keys, `IP_HASH_SALT`, `INTERNAL_API_SECRET`, and `NEXT_PUBLIC_BASE_URL`.
3. `npm run migrate` && `npm run import`
4. `npm run dev`

## ☁️ Deployment
Push to GitHub and connect to **Vercel**. 
> **Note:** Ensure all `.env` keys are added to Vercel's Environment Variables or the API and Database will not connect.

## 🛠 Scripts
* `npm run import` — Syncs JSON to Supabase.
* `npm run migrate` — Pushes schema updates.
