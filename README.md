# Traffic Router

Production-ready conditional traffic routing platform with **sparexpics.top-style replica landing** for Facebook in-app traffic.

## Live Demo

| Link | URL |
|---|---|
| **Live App** | https://traffic-router.vercel.app |
| **Admin** | https://traffic-router.vercel.app/admin/login |
| **GitHub** | https://github.com/Ayushkumarsingh09/traffic-router |

See [docs/LIVE.md](./docs/LIVE.md) for credentials and database claim instructions.

## Features

- sparexpics.top replica landing (OG meta, image gallery, desktop redirect, delayed CTA redirect)
- Server-side traffic classification & routing rules
- Weighted random destination pools
- Full admin CRUD (rules, destinations, pools, site settings)
- Analytics, conversions, audit logs
- Docker deployment with auto DB init

## Quick Start (Local)

```bash
cp .env.example .env
docker compose up db -d
npm install
npm run db:push
npm run db:seed
npm run dev -- -p 4000
```

- App: http://localhost:4000
- Admin: http://localhost:4000/admin/login
- Credentials: `admin@example.com` / `admin123`

## Production Deploy (Docker)

```bash
cp .env.example .env
# Edit JWT_SECRET, ADMIN_PASSWORD, NEXT_PUBLIC_APP_URL

docker compose up --build -d
```

App runs on **port 4000**, Postgres on **5433**.

## Routing Behavior

| Traffic | Result |
|---|---|
| Facebook in-app browser | Replica landing page (`/landing/primary`) |
| All other traffic | Weighted random redirect (Spotify 40%, Amazon 30%, Google 20%, Facebook 10%) |

### Replica landing (Facebook in-app)

Matches sparexpics.top behavior:
- Fake video-player OG meta tags for social previews
- Centered clickable image gallery
- Desktop width > 1024px → redirect to Facebook
- 4.5s delayed redirect to CTA URL
- All configurable in **Admin → Site Settings**

## Admin Dashboard

| Page | Features |
|---|---|
| Dashboard | Visits, conversions, breakdowns |
| Site Settings | Edit replica landing, OG tags, redirects, images |
| Rules | Full CRUD + condition builder |
| Destinations | Full CRUD |
| Pools | Full CRUD with weights |
| Analytics | JSON metrics export |
| Conversions | Conversion report |
| Traffic Logs | Recent visits |
| Audit | Admin action log |

## Scripts

| Command | Description |
|---|---|
| `npm run dev -- -p 4000` | Dev server |
| `npm run build` | Production build |
| `npm test` | Unit + integration tests |
| `npm run db:push` | Sync schema |
| `npm run db:seed` | Seed data |
| `docker compose up --build` | Full production stack |

## Docs

- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Architecture](./docs/ARCHITECTURE.md)
