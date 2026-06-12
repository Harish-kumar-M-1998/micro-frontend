# Microfrontend System Architecture

## Overview

This document describes the production-grade microfrontend architecture enabling independent team development and deployment.

## ASCII Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CDN / Load Balancer                               │
│                    (CloudFront, Cloudflare, nginx)                          │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────────────┐
│                         HOST APP (Shell) :5000                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │   Router    │  │  Auth Guard  │  │ Redux Store │  │  App Layout      │  │
│  │ React Router│  │ ProtectedRoute│  │  (shared)   │  │  Sidebar/Header  │  │
│  └──────┬──────┘  └──────────────┘  └──────┬──────┘  └──────────────────┘  │
│         │                                    │                               │
│         │         Module Federation          │                               │
│         ▼         Dynamic Import             ▼                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Lazy-loaded Remote Modules                         │   │
│  │  dashboardApp/DashboardPage  userApp/UserPage  reportsApp/Reports  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└───────────┬─────────────────────┬─────────────────────┬───────────────────────┘
            │                     │                     │
   ┌────────▼────────┐   ┌───────▼────────┐   ┌───────▼────────┐
   │ DASHBOARD :5001 │   │   USER :5002   │   │ REPORTS :5003  │
   │ remoteEntry.js  │   │ remoteEntry.js │   │ remoteEntry.js │
   └────────┬────────┘   └───────┬────────┘   └───────┬────────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  │
            ┌─────────────────────▼─────────────────────┐
            │              SHARED PACKAGES                   │
            │  ┌──────────────┐    ┌───────────────────┐   │
            │  │  shared-ui   │    │   shared-auth     │   │
            │  │  Components  │    │  Auth, API, Store │   │
            │  └──────────────┘    └───────────────────┘   │
            └─────────────────────┬─────────────────────┘
                                  │
            ┌─────────────────────▼─────────────────────┐
            │              BACKEND API :4000              │
            │         auth / users / reports              │
            └───────────────────────────────────────────┘

## Cross-MFE Communication

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Custom Events  │     │  Shared Redux   │     │   Event Bus     │
│ window.dispatch │     │  Single Store   │     │  eventBus.pub   │
│   Event()       │     │  via Provider   │     │  /subscribe     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    Used based on use case:
                    - Events: one-off notifications
                    - Redux: persistent global state
                    - Event Bus: structured pub/sub
```

## Folder Structure

```
microfrontend-system/
├── host-app/                 # Shell application - routing, layout, auth guards
│   ├── src/
│   │   ├── layouts/          # App shell (sidebar, header)
│   │   ├── pages/            # Host-owned pages (login, settings, 404)
│   │   ├── App.tsx           # Central route definitions
│   │   └── main.tsx          # Bootstrap with Redux Provider
│   └── vite.config.ts        # Federation HOST config (remotes)
│
├── dashboard-app/            # Dashboard team microfrontend
│   └── src/pages/            # Exposed DashboardPage module
│
├── user-app/                 # User management team microfrontend
│   └── src/pages/            # Exposed UserPage module
│
├── reports-app/              # Reports team microfrontend
│   └── src/pages/            # Exposed ReportsPage module
│
├── shared-ui/                # Design system component library
│   └── src/components/       # Button, Input, Modal, Table, Card
│
├── shared-auth/              # Authentication & shared state module
│   ├── src/services/         # API service layer
│   ├── src/store/            # Redux slices (auth, user, theme)
│   ├── src/events/           # Event bus & custom events
│   └── src/monitoring/       # Error tracking & analytics
│
├── docs/                     # Architecture & deployment documentation
├── docker/                   # nginx configs & security headers
├── .github/workflows/        # CI/CD pipelines
└── package.json              # npm workspaces root
```

## Module Federation

### Host Configuration

| Property | Purpose |
|----------|---------|
| `name` | Unique container identifier |
| `remotes` | Map of remote names → remoteEntry.js URLs |
| `shared` | Singleton dependencies shared across all MFEs |

### Remote Configuration

| Property | Purpose |
|----------|---------|
| `name` | Must match key in host's remotes |
| `filename` | Output manifest file (remoteEntry.js) |
| `exposes` | Modules available for host consumption |
| `shared` | Prevents duplicate React/Redux instances |

## Routing

Central routing lives in `host-app/src/App.tsx`:

| Route | Module | Guard |
|-------|--------|-------|
| `/` | Redirect → `/dashboard` | Protected |
| `/dashboard` | dashboardApp/DashboardPage | Protected |
| `/users` | userApp/UserPage | Protected |
| `/reports` | reportsApp/ReportsPage | Protected |
| `/settings` | host-app/SettingsPage | Protected |
| `/login` | host-app/LoginPage | Public |

## State Management Strategy

| State Type | Where | Example |
|------------|-------|---------|
| Global | Redux (shared-auth) | Auth, theme, user list |
| Local | Component useState | Form inputs, modals |
| Cross-MFE | Event Bus / Redux | User selected, report generated |

## Communication Comparison

| Approach | Pros | Cons | Best For |
|----------|------|------|----------|
| Custom Events | Native, zero deps | Untyped, hard to debug | Simple notifications |
| Shared Redux | Typed, predictable | Tight coupling | Auth, global UI state |
| Event Bus | Structured, testable | Another abstraction | Cross-team events |

## Performance

- **Lazy Loading**: Remote pages loaded on route navigation
- **Code Splitting**: manualChunks for vendor/redux bundles
- **Tree Shaking**: ES modules + Vite production build
- **Prefetching**: `<link rel="preconnect">` in host index.html
- **Bundle Analysis**: `npm run analyze -w host-app`

## Security

- XSS: React auto-escaping, CSP headers, no dangerouslySetInnerHTML
- CSRF: withCredentials + server-side tokens
- Secure Headers: nginx security-headers.conf
- Environment Variables: VITE_* prefix, never commit secrets
- Dependency Scanning: npm audit in CI pipeline
