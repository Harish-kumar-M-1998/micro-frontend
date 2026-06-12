# Netlify Setup — Step by Step (Fix Login & Host Integration)

## Important: How shared-auth and shared-ui work

`shared-auth` and `shared-ui` are **NOT separate Netlify sites**.

They are npm workspace packages **bundled inside each app** when you run `npm run build`. When you deploy `host-app`, `shared-auth` code is already included in the build output.

You only deploy **4 sites**: host + 3 remotes.

---

## Where to find Environment Variables in Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click your **host site** (e.g. `mfe-host`)
3. Left sidebar → **Site configuration** (or **Site settings**)
4. Click **Environment variables** (under "Build & deploy")
5. Click **Add a variable** → **Add a single variable**
6. Add each variable below, then click **Save**
7. Go to **Deploys** → **Trigger deploy** → **Deploy site** (rebuild required!)

Direct URL pattern:
```
https://app.netlify.com/sites/YOUR-SITE-NAME/configuration/env
```

---

## Correct Netlify settings per site

### CRITICAL: Base directory must be repo ROOT (empty)

Do **NOT** set "Base directory" to `host-app`. The monorepo needs the root `package.json` for workspaces.

| Field | Value for ALL 4 sites |
|-------|----------------------|
| Base directory | *(leave empty)* |
| Branch | `main` |

---

### Site 1: Dashboard (`mfe-dashboard`)

| Field | Value |
|-------|-------|
| Build command | `npm ci && npm run build -w dashboard-app` |
| Publish directory | `dashboard-app/dist` |
| Environment variables | `NODE_VERSION` = `20` |

No other env vars needed for remotes.

---

### Site 2: User (`mfe-user`)

| Field | Value |
|-------|-------|
| Build command | `npm ci && npm run build -w user-app` |
| Publish directory | `user-app/dist` |
| Environment variables | `NODE_VERSION` = `20` |

---

### Site 3: Reports (`mfe-reports`)

| Field | Value |
|-------|-------|
| Build command | `npm ci && npm run build -w reports-app` |
| Publish directory | `reports-app/dist` |
| Environment variables | `NODE_VERSION` = `20` |

---

### Site 4: Host (`mfe-host`) — deploy LAST

| Field | Value |
|-------|-------|
| Build command | `npm ci && npm run build -w dashboard-app && npm run build -w user-app && npm run build -w reports-app && npm run build -w host-app` |
| Publish directory | `host-app/dist` |

**Environment variables (REQUIRED):**

| Key | Value (replace with YOUR Netlify URLs) |
|-----|----------------------------------------|
| `NODE_VERSION` | `20` |
| `VITE_DEMO_MODE` | `true` |
| `VITE_DASHBOARD_REMOTE` | `https://YOUR-DASHBOARD.netlify.app/assets/remoteEntry.js` |
| `VITE_USER_REMOTE` | `https://YOUR-USER.netlify.app/assets/remoteEntry.js` |
| `VITE_REPORTS_REMOTE` | `https://YOUR-REPORTS.netlify.app/assets/remoteEntry.js` |

**How to find your remote URLs:**
1. Open each remote site in Netlify
2. Copy the site URL (e.g. `https://mfe-dashboard.netlify.app`)
3. Append `/assets/remoteEntry.js`

Example:
```
https://mfe-dashboard.netlify.app/assets/remoteEntry.js
```

---

## Deploy order

```
1. Deploy mfe-dashboard  →  wait for success
2. Deploy mfe-user       →  wait for success
3. Deploy mfe-reports    →  wait for success
4. Set env vars on mfe-host with the 3 remote URLs above
5. Deploy mfe-host       →  trigger rebuild
```

---

## Verify everything works

### Step 1: Check remoteEntry.js (must be JavaScript, not HTML)

```bash
curl https://YOUR-DASHBOARD.netlify.app/assets/remoteEntry.js | head -c 80
```

Good output: `const g={},E=new Set...`
Bad output: `<!DOCTYPE html>`

### Step 2: Login on host

1. Open `https://YOUR-HOST.netlify.app`
2. Login with any email containing `@` and any password
3. Navigate to Dashboard, Users, Reports

---

## Why login showed "Network Error"

Two causes (both now fixed in code):

| Problem | Cause | Fix |
|---------|-------|-----|
| Network error on login | Production build called `localhost:4000/api` (no backend) | Set `VITE_DEMO_MODE=true` on host |
| Remotes not loading | Host built without `VITE_*_REMOTE` URLs | Set remote URLs on host, rebuild |
| Wrong base directory | `host-app` as base breaks npm workspaces | Leave base directory **empty** |

---

## Netlify UI navigation (2024/2025 layout)

```
Netlify Dashboard
└── [Your site name]
    ├── Deploys
    ├── Site configuration      ← click here
    │   ├── General
    │   ├── Build & deploy
    │   │   ├── Continuous deployment
    │   │   │   ├── Build settings     ← build command & publish dir
    │   │   │   └── Environment variables  ← ADD VITE_* HERE
    │   └── Domain management
    └── ...
```

Alternative path:
```
Site settings → Build & deploy → Environment → Environment variables
```

---

## After changing environment variables

Environment variables only apply on the **next build**. You must:

1. **Deploys** tab
2. **Trigger deploy** → **Deploy site** (or push a new commit to `main`)

---

## Quick checklist

- [ ] All 4 sites use **empty** base directory (repo root)
- [ ] 3 remotes deployed and `remoteEntry.js` returns JavaScript
- [ ] Host has `VITE_DEMO_MODE=true`
- [ ] Host has all 3 `VITE_*_REMOTE` URLs pointing to production remotes
- [ ] Host redeployed **after** setting env vars
- [ ] Login works with `admin@test.com` / any password
