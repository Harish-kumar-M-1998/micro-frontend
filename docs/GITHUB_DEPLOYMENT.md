# GitHub + CI/CD + Netlify/Render Deployment Guide

Complete guide to push this microfrontend monorepo to GitHub and auto-deploy on every push to `main`.

---

## Netlify vs Render — Which to Choose?

| Feature | Netlify (Recommended) | Render |
|---------|----------------------|--------|
| Static site hosting | Excellent | Good |
| Monorepo (4 sites) | Easy — 4 sites, same repo | Blueprint (`render.yaml`) |
| Free tier | 100 GB bandwidth/month | 100 GB bandwidth/month |
| Auto-deploy from GitHub | Native integration | Native integration |
| CORS headers for MFE | `_headers` file | `render.yaml` headers |
| Preview deploys per PR | Yes | Yes |
| Docker support | No (static only) | Yes (use `docker-compose`) |
| Setup difficulty | Easy | Medium |

**Recommendation:** Use **Netlify** for this project. It's simpler for static Vite builds and handles multiple sites from one monorepo well.

Use **Render** if you prefer infrastructure-as-code (`render.yaml`) or plan to add a backend API later.

---

## Architecture on Production

```
https://mfe-host.netlify.app          ← Host (shell, routing)
    │
    ├── loads remoteEntry.js from:
    │   https://mfe-dashboard.netlify.app/assets/remoteEntry.js
    │   https://mfe-user.netlify.app/assets/remoteEntry.js
    │   https://mfe-reports.netlify.app/assets/remoteEntry.js
    │
    └── Each remote is an independent Netlify site
```

You need **4 separate deployments** (1 host + 3 remotes).

---

## Part 1 — Push to GitHub

### Step 1: Create GitHub repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `microfrontend-system` (or your choice)
3. Visibility: Public or Private
4. **Do NOT** initialize with README (we already have one)
5. Click **Create repository**

### Step 2: Initialize git and push

```bash
cd /home/harish/Projects/Cursor/microfrontend

# Initialize git (skip if already done)
git init
git branch -M main

# Add all files
git add .
git commit -m "Initial commit: microfrontend platform"

# Connect to GitHub (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/microfrontend-system.git
git push -u origin main
```

### Step 3: Verify CI runs

After pushing, go to your repo → **Actions** tab. You should see the **CI** workflow running (lint, test, build).

---

## Part 2 — Deploy on Netlify (Recommended)

### Step 1: Create 4 Netlify sites

Go to [app.netlify.com](https://app.netlify.com) and create **4 sites** from the same GitHub repo:

#### Site 1: Dashboard Remote

| Setting | Value |
|---------|-------|
| Site name | `mfe-dashboard` (or custom) |
| Branch | `main` |
| Base directory | *(leave empty — repo root)* |
| Build command | `npm ci && npm run build -w dashboard-app` |
| Publish directory | `dashboard-app/dist` |
| Node version | `20` (Environment variables → `NODE_VERSION` = `20`) |

#### Site 2: User Remote

| Setting | Value |
|---------|-------|
| Site name | `mfe-user` |
| Build command | `npm ci && npm run build -w user-app` |
| Publish directory | `user-app/dist` |

#### Site 3: Reports Remote

| Setting | Value |
|---------|-------|
| Site name | `mfe-reports` |
| Build command | `npm ci && npm run build -w reports-app` |
| Publish directory | `reports-app/dist` |

#### Site 4: Host (deploy LAST)

| Setting | Value |
|---------|-------|
| Site name | `mfe-host` |
| Build command | See below |
| Publish directory | `host-app/dist` |

**Host environment variables** (Site settings → Environment variables):

```
VITE_DASHBOARD_REMOTE = https://mfe-dashboard.netlify.app/assets/remoteEntry.js
VITE_USER_REMOTE      = https://mfe-user.netlify.app/assets/remoteEntry.js
VITE_REPORTS_REMOTE   = https://mfe-reports.netlify.app/assets/remoteEntry.js
VITE_API_BASE_URL     = https://your-api.example.com/api
```

Replace `mfe-dashboard`, `mfe-user`, `mfe-reports` with your actual Netlify site names.

**Host build command:**

```bash
npm ci && npm run build -w dashboard-app && npm run build -w user-app && npm run build -w reports-app && npm run build -w host-app
```

> Deploy remotes first. Once you have their URLs, set the `VITE_*_REMOTE` env vars on the host site, then trigger a host redeploy.

### Step 2: Enable auto-deploy on push

For each Netlify site:

1. **Site settings** → **Build & deploy** → **Continuous deployment**
2. Ensure **Build hooks** / **Deploy on push** is enabled for branch `main`
3. Netlify will auto-rebuild when you `git push` to `main`

### Step 3: Verify deployment

```bash
# Remote entry files must return JavaScript (not HTML)
curl https://mfe-dashboard.netlify.app/assets/remoteEntry.js | head -c 80
curl https://mfe-user.netlify.app/assets/remoteEntry.js | head -c 80

# Host should load
open https://mfe-host.netlify.app
```

### Reference configs

Example Netlify configs are in `deploy/netlify/`:

- `deploy/netlify/remote-dashboard.toml`
- `deploy/netlify/remote-user.toml`
- `deploy/netlify/remote-reports.toml`
- `deploy/netlify/host.toml`

---

## Part 3 — GitHub Actions Auto-Deploy (Netlify)

Use this when you want **one pipeline** that runs CI + deploys all 4 sites on push to `main`.

The workflow file is already at `.github/workflows/deploy.yml`.

### Step 1: Get Netlify credentials

1. **Personal access token:** [app.netlify.com/user/applications](https://app.netlify.com/user/applications) → New access token
2. **Site IDs:** Each site → Site settings → General → Site ID (API ID)

### Step 2: Add GitHub Secrets

Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Example Value |
|--------|---------------|
| `NETLIFY_AUTH_TOKEN` | `nfp_xxxxxxxx` |
| `NETLIFY_SITE_ID_HOST` | `abc123-host-site-id` |
| `NETLIFY_SITE_ID_DASHBOARD` | `abc123-dashboard-site-id` |
| `NETLIFY_SITE_ID_USER` | `abc123-user-site-id` |
| `NETLIFY_SITE_ID_REPORTS` | `abc123-reports-site-id` |
| `VITE_DASHBOARD_REMOTE` | `https://mfe-dashboard.netlify.app/assets/remoteEntry.js` |
| `VITE_USER_REMOTE` | `https://mfe-user.netlify.app/assets/remoteEntry.js` |
| `VITE_REPORTS_REMOTE` | `https://mfe-reports.netlify.app/assets/remoteEntry.js` |
| `VITE_API_BASE_URL` | `https://your-api.example.com/api` |

### Step 3: Create GitHub Environment (optional but recommended)

1. Repo → **Settings** → **Environments** → **New environment** → `production`
2. Add protection rules (require approval for production deploys) if needed

### Step 4: Push to main — auto-deploy runs

```bash
git add .
git commit -m "feat: add deployment config"
git push origin main
```

Pipeline flow:

```
push to main
    → CI (lint + test)
    → Build all apps
    → Deploy remotes (dashboard, user, reports)
    → Deploy host
    → Smoke test (optional)
```

View progress: GitHub → **Actions** → **Deploy** workflow.

### Disable Netlify auto-deploy (if using GitHub Actions only)

If GitHub Actions handles all deploys, disable Netlify's built-in deploy to avoid double deployments:

Each Netlify site → **Build & deploy** → **Stop builds** (or set to deploy only via build hook).

---

## Part 4 — Deploy on Render (Alternative)

### Step 1: Connect GitHub

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. **New** → **Blueprint**
3. Connect your GitHub repo
4. Render reads `render.yaml` from the repo root

### Step 2: Set environment variables on host service

After remotes deploy, open the `mfe-host` service in Render and set:

```
VITE_DASHBOARD_REMOTE = https://mfe-dashboard.onrender.com/assets/remoteEntry.js
VITE_USER_REMOTE      = https://mfe-user.onrender.com/assets/remoteEntry.js
VITE_REPORTS_REMOTE   = https://mfe-reports.onrender.com/assets/remoteEntry.js
```

Then trigger a manual redeploy of the host.

### Step 3: Auto-deploy

Render auto-deploys on every push to `main` by default.

---

## Part 5 — Day-to-Day Workflow

```bash
# 1. Develop locally
npm run dev:all

# 2. Commit changes
git add .
git commit -m "feat: update dashboard stats"
git push origin main

# 3. CI runs automatically (lint, test, build)
# 4. Deploy runs automatically (if deploy.yml configured)
# 5. Visit production URL after ~3-5 minutes
```

### Deploy only one microfrontend

Each remote is independent. Pushing changes to `dashboard-app/` triggers only the dashboard Netlify/Render site rebuild (if using per-site Netlify auto-deploy).

If using GitHub Actions `deploy.yml`, the full pipeline runs but only changed artifacts are redeployed.

---

## Part 6 — Troubleshooting

### Host shows blank page / "Something went wrong"

1. Check browser DevTools → Network → `remoteEntry.js` requests
2. Verify remote URLs in host build env vars are correct
3. Ensure remotes deployed **before** host was last built

```bash
curl -I https://mfe-user.netlify.app/assets/remoteEntry.js
# Should return 200 with JavaScript content
```

### CORS error loading remoteEntry.js

Remotes must serve CORS headers on `/assets/*`. This project includes `public/_headers` in each remote app. Rebuild and redeploy remotes.

### Host works locally but not in production

Production host must be built with `VITE_*_REMOTE` env vars pointing to production URLs, not `localhost`.

### GitHub Actions deploy fails

- Verify all `NETLIFY_SITE_ID_*` secrets are set
- Verify `NETLIFY_AUTH_TOKEN` is valid
- Check Actions log for the failing job

### Port already in use (local)

```bash
npm run dev:stop
npm run dev:all
```

---

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] CI workflow passes (Actions tab)
- [ ] 4 Netlify sites created (or Render blueprint deployed)
- [ ] Remotes deployed and `remoteEntry.js` accessible
- [ ] Host env vars set with production remote URLs
- [ ] Host deployed and login works at production URL
- [ ] GitHub secrets configured for auto-deploy (optional)
- [ ] `deploy.yml` workflow passes on push to `main`

---

## File Reference

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Lint, test, build on PR and push |
| `.github/workflows/deploy.yml` | Auto-deploy to Netlify on push to `main` |
| `deploy/netlify/*.toml` | Netlify build config templates |
| `render.yaml` | Render blueprint for 4 static sites |
| `*/public/_headers` | CORS headers for remote MFE assets |
| `host-app/public/_redirects` | SPA routing for host |
