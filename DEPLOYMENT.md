# ANODE Frontend – CI/CD & Deployment

## Ports & branches

- **Frontend port:** `3231` (dev server & preview; Docker maps host **3231** → container 80).
- **Branches:** `dev` (default), `main` (production). Push to `main` triggers deploy.
- **Repo:** Public.

## GitHub repo settings

1. **Default branch:** Set **dev** as default: Repo → Settings → General → Default branch → dev.
2. **Secrets** (for Deploy workflow): `SERVER_IP`, `SERVER_PASSWORD`.

## Local

- **Dev:** `npm run dev` → http://localhost:**3231**
- **Preview:** `npm run preview` → http://localhost:**3231**
- **API:** Set `VITE_API_BASE_URL=http://localhost:3232` for backend (port 3232).

## Docker

- `docker compose up -d --build` → frontend on **3231**.

## Workflows

- **CI** (`.github/workflows/ci.yml`): on push/PR to `main` and `dev` – install, build, Docker build.
- **Deploy** (`.github/workflows/deploy.yml`): on push to `main` – SSH deploy (expects app at `/var/www/myapp-frontend`).
