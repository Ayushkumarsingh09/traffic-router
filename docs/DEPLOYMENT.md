# Deployment Guide

## Docker (Recommended)

### 1. Configure environment

```bash
cp .env.example .env
```

Set these before production:

| Variable | Description |
|---|---|
| `JWT_SECRET` | Long random string (required) |
| `ADMIN_PASSWORD` | Strong admin password |
| `NEXT_PUBLIC_APP_URL` | Public URL (e.g. `https://yourdomain.com`) |
| `RUN_SEED` | `true` on first deploy, `false` after |
| `SEED_RULES` | `true` on first deploy only |

### 2. Deploy

```bash
docker compose up --build -d
```

Services:
- **App:** http://localhost:4000 (container port 3000)
- **PostgreSQL:** localhost:5433

The entrypoint automatically runs `prisma migrate deploy` (or `db push`) and seeds when `RUN_SEED=true`.

### 3. Verify

```bash
curl http://localhost:4000/admin/login
```

Login at `/admin/login` with your admin credentials.

## Manual Deployment

```bash
npm ci
cp .env.example .env
npx prisma db push
npm run db:seed
npm run build
npm start
```

## Production Checklist

- [ ] Set strong `JWT_SECRET` and `ADMIN_PASSWORD`
- [ ] Set `NEXT_PUBLIC_APP_URL` to your public HTTPS URL
- [ ] Set `RUN_SEED=false` after first deploy
- [ ] Put HTTPS reverse proxy in front (Nginx/Caddy/Cloudflare)
- [ ] Configure database backups
- [ ] Review site settings in admin (CTA URL, OG tags, images)
- [ ] Review routing rules and destination pools

## Nginx Example

```nginx
server {
  listen 443 ssl;
  server_name yourdomain.com;

  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Ports

| Service | Host Port | Container Port |
|---|---|---|
| App | 4000 | 3000 |
| PostgreSQL | 5433 | 5432 |
