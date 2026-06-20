# Live Deployment

## Production URLs

| Service | URL |
|---|---|
| **Live App** | https://traffic-router.vercel.app |
| **Admin Dashboard** | https://traffic-router.vercel.app/admin/login |
| **Replica Landing** | https://traffic-router.vercel.app/landing/primary |
| **GitHub Repo** | https://github.com/Ayushkumarsingh09/traffic-router |
| **Vercel Dashboard** | https://vercel.com/ayushs-projects-e5782a01/traffic-router |

## Admin Credentials (Production)

| Field | Value |
|---|---|
| Email | `admin@example.com` |
| Password | Set in Vercel env (`ADMIN_PASSWORD`) — check your Vercel project settings |

## Database (Important — Action Required)

Production uses **Prisma Postgres**. **Claim your database** to keep it permanently (otherwise it auto-deletes after 24h):

**Claim URL:** https://create-db.prisma.io/claim?projectID=proj_cmqmoytvs0by1vkfbxmgrgzsj

After claiming, update `DATABASE_URL` in Vercel if the connection string changes.

## Post-Deploy Checklist

- [x] GitHub repository created and pushed
- [x] Vercel production deployment
- [x] PostgreSQL provisioned (Prisma Postgres)
- [x] Environment variables configured
- [x] Database seeded with rules and replica settings
- [ ] **Claim Prisma database** (see link above)
- [ ] Change `ADMIN_PASSWORD` in Vercel after first login
- [ ] Set `RUN_SEED=false` in Vercel after first deploy

## Vercel Environment Variables

Configured in Vercel → Project → Settings → Environment Variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_APP_URL` = `https://traffic-router.vercel.app`
- `GEOIP_API_URL` = `https://ip-api.com/json`
- `RUN_SEED` / `SEED_RULES`
