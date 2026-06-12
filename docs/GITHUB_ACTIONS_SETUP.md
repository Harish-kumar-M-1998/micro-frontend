# GitHub Actions Setup — Step by Step

Your repo already has two workflows:

| Workflow | File | When it runs |
|----------|------|--------------|
| **CI** | `.github/workflows/ci.yml` | Every push/PR to `main` or `develop` |
| **Deploy** | `.github/workflows/deploy.yml` | Every push to `main` + manual trigger |

Deploy pipeline:

```
push to main
  → CI (lint + test)
  → Build all 4 apps
  → Deploy dashboard, user, reports (parallel)
  → Deploy host (last)
```

---

## Step 1 — Get Netlify Auth Token

1. Go to [app.netlify.com/user/applications](https://app.netlify.com/user/applications)
2. Click **New access token**
3. Name it: `github-actions-mfe`
4. Copy the token (starts with `nfp_...`) — you won't see it again

---

## Step 2 — Get Netlify Site IDs (all 4 sites)

For **each** of your 4 Netlify sites:

1. Open the site in Netlify
2. **Site configuration** → **General** → **Site details**
3. Copy **Site ID** (also called API ID, looks like `a1b2c3d4-e5f6-...`)

| Your site | Secret name to create |
|-----------|----------------------|
| Host (`mfe-host` or similar) | `NETLIFY_SITE_ID_HOST` |
| Dashboard (`mfe-dashboard-app`) | `NETLIFY_SITE_ID_DASHBOARD` |
| User | `NETLIFY_SITE_ID_USER` |
| Reports | `NETLIFY_SITE_ID_REPORTS` |

---

## Step 3 — Add GitHub Secrets

1. Open your repo: [github.com/Harish-kumar-M-1998/micro-frontend](https://github.com/Harish-kumar-M-1998/micro-frontend)
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below:

### Required secrets

| Secret name | Value |
|-------------|-------|
| `NETLIFY_AUTH_TOKEN` | Your Netlify token from Step 1 |
| `NETLIFY_SITE_ID_HOST` | Site ID of host site |
| `NETLIFY_SITE_ID_DASHBOARD` | Site ID of dashboard site |
| `NETLIFY_SITE_ID_USER` | Site ID of user site |
| `NETLIFY_SITE_ID_REPORTS` | Site ID of reports site |
| `VITE_DASHBOARD_REMOTE` | `https://mfe-dashboard-app.netlify.app/assets/remoteEntry.js` |
| `VITE_USER_REMOTE` | `https://YOUR-USER-SITE.netlify.app/assets/remoteEntry.js` |
| `VITE_REPORTS_REMOTE` | `https://YOUR-REPORTS-SITE.netlify.app/assets/remoteEntry.js` |

Use the **same URLs** you already set in Netlify host environment variables.

### Optional secrets

| Secret name | Value |
|-------------|-------|
| `VITE_API_BASE_URL` | Only when you have a real backend API |

---

## Step 4 — Create GitHub Environment (recommended)

1. Repo → **Settings** → **Environments**
2. Click **New environment** → name it `production`
3. (Optional) Enable **Required reviewers** for approval before deploy

The deploy workflow uses `environment: production` for all deploy jobs.

---

## Step 5 — Disable Netlify auto-deploy (avoid double deploys)

If GitHub Actions deploys for you, turn off Netlify's built-in deploy on push:

For **each** of the 4 sites:
1. **Site configuration** → **Build & deploy** → **Continuous deployment**
2. Click **Configure** on the GitHub connection
3. Set **Branch deploys** to **None** or **Stop builds**

Alternatively, keep Netlify auto-deploy and **delete** `.github/workflows/deploy.yml` — use only CI from GitHub Actions.

**Recommended:** GitHub Actions for deploy (more control) + disable Netlify auto-build.

To stop builds only:
- **Site configuration** → **Build & deploy** → **Build settings** → **Stop builds**

GitHub Actions will still deploy via the API using your token.

---

## Step 6 — Push and verify

```bash
git add .
git commit -m "ci: configure GitHub Actions deploy pipeline"
git push origin main
```

Watch progress:
1. Repo → **Actions** tab
2. Click the **Deploy** workflow run
3. All jobs should be green:
   - CI Checks
   - Build All Apps
   - Deploy Dashboard / User / Reports
   - Deploy Host

---

## Step 7 — Manual deploy (without pushing code)

1. **Actions** tab → **Deploy** workflow
2. Click **Run workflow** → branch `main` → **Run workflow**

---

## Troubleshooting

### `NETLIFY_AUTH_TOKEN` invalid
- Generate a new token at Netlify → Applications
- Update the GitHub secret

### `Site not found` / wrong site deployed
- Verify each `NETLIFY_SITE_ID_*` matches the correct site
- Site ID is in Netlify → Site configuration → General

### CI passes but host login fails after deploy
- Check `VITE_*_REMOTE` secrets match your live Netlify URLs
- `VITE_DEMO_MODE` is set to `true` in the workflow (already configured)

### Double deployments
- Disable Netlify auto-build on all 4 sites (Step 5)

### Lint fails on CI
```bash
npm run lint   # fix locally, then push
```

---

## What runs on a Pull Request?

Only **CI** workflow runs (lint, test, build). **No deploy** until merged to `main`.

---

## Secrets checklist

```
[ ] NETLIFY_AUTH_TOKEN
[ ] NETLIFY_SITE_ID_HOST
[ ] NETLIFY_SITE_ID_DASHBOARD
[ ] NETLIFY_SITE_ID_USER
[ ] NETLIFY_SITE_ID_REPORTS
[ ] VITE_DASHBOARD_REMOTE
[ ] VITE_USER_REMOTE
[ ] VITE_REPORTS_REMOTE
[ ] production environment created (optional)
[ ] Netlify auto-build disabled (optional)
[ ] Pushed to main and Actions tab is green
```
