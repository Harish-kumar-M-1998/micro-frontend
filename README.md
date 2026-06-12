# Microfrontend Platform

Production-ready microfrontend architecture enabling independent team development and deployment at enterprise scale.

## Architecture

```
Host (Shell) ──federation──▶ Dashboard MFE
              ──federation──▶ User Management MFE
              ──federation──▶ Reports MFE
              ──workspace───▶ Shared UI + Shared Auth
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Module Federation | Runtime microfrontend integration |
| React Router 7 | Client-side routing |
| Redux Toolkit | Global state management |
| Tailwind CSS | Utility-first styling |
| Axios | HTTP client with interceptors |
| Vitest | Unit & component testing |
| ESLint + Prettier | Code quality |

## Quick Start

```bash
# Clone and install
npm install

# Copy environment config
cp host-app/.env.example host-app/.env

# Start all microfrontends (host dev + remotes build/preview)
npm run dev:all
```

Open **http://localhost:5000** and sign in with any email containing `@` (demo mode).

> **Important:** Remotes must run via `vite build --watch` + `vite preview` (not plain `vite dev`).
> Module Federation requires a physical `remoteEntry.js` file which Vite dev mode does not generate.
> `npm run dev:all` handles this automatically. To develop a remote in isolation use `npm run dev:standalone -w user-app`.

## Project Structure

```
microfrontend-system/
├── host-app/           # Shell: routing, layout, auth guards
├── dashboard-app/      # Dashboard microfrontend (remote)
├── user-app/           # User management microfrontend (remote)
├── reports-app/        # Reports microfrontend (remote)
├── shared-ui/          # Component library (Button, Modal, Input, Table, Card)
├── shared-auth/        # Auth module, Redux store, API services
├── docs/               # Architecture & deployment guides
├── docker/             # Container configs
└── .github/workflows/  # CI/CD pipeline
```

## Routes

| Path | Microfrontend | Description |
|------|---------------|-------------|
| `/dashboard` | dashboard-app | Analytics dashboard |
| `/users` | user-app | User management |
| `/reports` | reports-app | Report generation |
| `/settings` | host-app | Profile & theme settings |
| `/login` | host-app | Authentication |

## Scripts

```bash
npm run dev:all      # Start all MFEs concurrently
npm run build        # Production build all apps
npm run test         # Run all tests
npm run lint         # ESLint all workspaces
npm run format       # Prettier format
npm run analyze      # Bundle size analysis
npm run docker:up    # Docker Compose deployment
```

## Module Federation

**Host** consumes remotes dynamically:

```typescript
const DashboardPage = lazy(() => import('dashboardApp/DashboardPage'));
```

**Remotes** expose pages:

```typescript
federation({
  name: 'userApp',
  filename: 'remoteEntry.js',
  exposes: { './UserPage': './src/pages/UserPage.tsx' },
  shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
});
```

## Authentication

- JWT access token (sessionStorage) + refresh token (localStorage)
- Automatic token refresh via Axios interceptor
- Protected routes with role-based access control
- Demo mode for local development (no backend required)

## Cross-MFE Communication

Three patterns implemented in `@mfe/shared-auth`:

1. **Custom Events** — `dispatchMfeEvent()` / `listenMfeEvent()`
2. **Shared Redux Store** — Single store via React Provider
3. **Event Bus** — `eventBus.publish()` / `eventBus.subscribe()`

## Docker

```bash
docker-compose up --build -d
```

Services: host (:5000), dashboard (:5001), user (:5002), reports (:5003)

## Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) — System design, diagrams, patterns
- [Deployment Guide](docs/DEPLOYMENT.md) — Production deployment flow
- [GitHub + CI/CD + Netlify/Render Guide](docs/GITHUB_DEPLOYMENT.md) — **Push to GitHub & auto-deploy**
- [Development Guide](docs/DEVELOPMENT.md) — Team workflow & best practices

## License

MIT
