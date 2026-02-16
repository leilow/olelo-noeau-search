# Architecture

High-level structure of ʻŌlelo Noʻeau Search.

## System overview

```mermaid
flowchart LR
  subgraph Client
    Browser
  end

  subgraph Vercel["Vercel (Edge + Serverless)"]
    Proxy["proxy.ts\n(Edge)"]
    App["Next.js App\n(/, /search, /account)"]
    API["API Routes\n/phrases, /submissions, …"]
    Proxy --> App
    Proxy --> API
  end

  subgraph Supabase
    Auth["Auth"]
    DB[(Database\nphrases, favorites,\nsubmissions, …)]
  end

  Browser --> Proxy
  App --> Auth
  App --> DB
  API --> Auth
  API --> DB
```

## Request flow

```mermaid
sequenceDiagram
  participant User
  participant Proxy
  participant Page
  participant API
  participant Supabase

  User->>Proxy: Request (e.g. /search)
  Proxy->>Proxy: API allowlist check (if /api/*)
  Proxy->>Proxy: Supabase auth (cookies)
  Proxy->>Page: NextResponse.next()
  Page->>User: HTML / client bundle

  Note over User,API: Client-side (e.g. search page)
  User->>API: fetch /api/phrases (same-origin)
  API->>Supabase: Service role → phrases, etc.
  Supabase->>API: Data
  API->>User: JSON
```

## App structure

```mermaid
flowchart TB
  subgraph Next["Next.js App Router"]
    layout["app/layout.tsx\nAnalytics, SpeedInsights"]
    home["app/page.tsx\nHome"]
    search["app/search/page.tsx\nSearch"]
    account["app/account/page.tsx\nAccount"]
    layout --> home
    layout --> search
    layout --> account
  end

  subgraph API["API routes"]
    phrases["/api/phrases"]
    submissions["/api/submissions"]
    daily["/api/daily-pull"]
    random["/api/random-phrase"]
    members["/api/members/count"]
  end

  subgraph Data
    phrases_json["data/phrases-with-meta-tags.json"]
    supabase[(Supabase\nphrases, favorites,\nsubmissions, auth)]
  end

  search --> phrases
  home --> daily
  phrases --> supabase
  daily --> supabase
  submissions --> supabase
```

## Security

- **API:** Only same-origin or requests with `x-internal-secret` (see `lib/api-auth.ts`) can call `/api/*`.
- **Supabase:** RLS on tables; service role used only in API routes (server-side).
- **Proxy:** Runs on Edge; handles auth cookie refresh and API allowlist.

---

Mermaid diagrams render on GitHub and in many editors. Edit this file to keep the chart in sync with the project.
