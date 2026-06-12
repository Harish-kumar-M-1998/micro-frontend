# Deployment Guide

## Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose (for containerized deployment)

## Local Development

```bash
# Install dependencies
npm install

# Start everything (recommended)
npm run dev:all
```

This starts:
- **Host** (`:5000`) — Vite dev server (fast HMR)
- **Remotes** (`:5001–5003`) — `vite build --watch` + `vite preview`

Module Federation requires remotes to serve a built `remoteEntry.js`. Plain `vite dev` on remotes does **not** work with the host — each remote's `/assets/remoteEntry.js` returns HTML instead of JS in dev mode.

```bash
# Or start individually:
npm run dev -w host-app        # :5000 (host only)
npm run dev -w dashboard-app   # :5001 (build --watch + preview)
npm run dev -w user-app        # :5002 (build --watch + preview)
npm run dev -w reports-app     # :5003 (build --watch + preview)

# Develop a remote in isolation (no federation):
npm run dev:standalone -w user-app
```

Open http://localhost:5000 and login with any email containing `@`.

## Production Build

```bash
npm run build
```

Build order matters for federation:
1. Build remotes first (dashboard, user, reports)
2. Build host last (references remote URLs)

## Docker Deployment

```bash
# Build and start all services
docker-compose up --build -d

# Verify health
curl http://localhost:5000
curl http://localhost:5001/assets/remoteEntry.js
```

## Deployment Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   Push   │───▶│  CI/CD   │───▶│  Build   │───▶│  Deploy  │
│  to main │    │  Lint    │    │  Docker  │    │  to CDN  │
└──────────┘    │  Test    │    │  Images  │    └──────────┘
                └──────────┘    └──────────┘
```

### Independent Deployment Strategy

Each microfrontend deploys independently:

1. **Remote MFE** (e.g., user-app v2.1.0)
   - Build → Upload dist/ to CDN at `/user-app/v2.1.0/`
   - remoteEntry.js available at stable URL

2. **Host Shell** (update remote URLs if needed)
   - Update `VITE_USER_REMOTE` env var
   - Deploy host bundle

3. **Rollback**
   - Point remote URL to previous version
   - No host redeployment needed if using versioned URLs

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://api.example.com` |
| `VITE_DASHBOARD_REMOTE` | Dashboard remoteEntry URL | CDN URL |
| `VITE_USER_REMOTE` | User remoteEntry URL | CDN URL |
| `VITE_REPORTS_REMOTE` | Reports remoteEntry URL | CDN URL |
| `VITE_LOG_ENDPOINT` | Log aggregator endpoint | Datadog/CloudWatch |

## CDN Configuration

```
cdn.example.com/
├── host/                    # Shell app (latest)
├── dashboard/v1.2.0/        # Versioned remote
├── user/v2.1.0/
└── reports/v1.0.3/
```

Configure CORS on CDN for remoteEntry.js:
```
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET
```

## Kubernetes (Optional)

Each MFE runs as a separate deployment with its own:
- Horizontal Pod Autoscaler
- Service + Ingress
- ConfigMap for remote URLs

## Monitoring Post-Deploy

- Verify remoteEntry.js loads (Network tab)
- Check for shared dependency version conflicts (Console)
- Run smoke tests against all routes
- Monitor error rates in Sentry/Datadog
