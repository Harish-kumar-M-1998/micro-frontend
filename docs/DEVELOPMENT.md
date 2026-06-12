# Development Workflow

## Team Collaboration

### Repository Strategy

**Option A: Monorepo (this project)**
- Single repo, npm workspaces
- Shared packages versioned together
- Easier refactoring across MFEs

**Option B: Polyrepo**
- Each MFE in separate repo
- shared-ui/shared-auth published to npm registry
- True team autonomy

### Branch Strategy

```
main          ─── production releases
develop       ─── integration branch
feature/*     ─── team feature branches
release/*     ─── release candidates
```

### Independent Team Workflow

1. **Dashboard Team** owns `dashboard-app/`
2. **User Team** owns `user-app/`
3. **Reports Team** owns `reports-app/`
4. **Platform Team** owns `host-app/`, `shared-ui/`, `shared-auth/`

Each team:
- Develops locally with `npm run dev -w <their-app>`
- Runs tests: `npm run test -w <their-app>`
- Deploys independently to their CDN path

## Versioning

- **Semantic Versioning** for shared packages
- **Remote MFE versions** tracked via CDN paths
- **Host** references specific remote versions via env vars

## Local Development Tips

### Running without all remotes

The host requires all three remotes to be serving `remoteEntry.js` via preview mode. Always use `npm run dev:all`.

### Standalone remote development

Each remote has a standalone mode for isolated UI work (no federation):

```bash
npm run dev:standalone -w user-app
# Opens http://localhost:5002 with UserPage rendered directly
```

### Remote hot reload with host

Remote `dev` script runs `vite build --watch` + `vite preview`. After saving changes in a remote, refresh the host browser to see updates (typically 2–3 seconds for rebuild).

### Shared package changes

Changes to `shared-ui` or `shared-auth` hot-reload in all apps via workspace symlinks.

## Code Quality

```bash
npm run lint          # ESLint across all workspaces
npm run format        # Prettier formatting
npm run test          # Vitest unit tests
npm run analyze -w host-app  # Bundle size analysis
```

## Best Practices

1. **Never duplicate shared dependencies** - use federation `shared` config
2. **Keep remotes route-agnostic** - host owns routing
3. **Use shared-auth for cross-MFE state** - don't create local auth
4. **Version shared packages carefully** - breaking changes affect all teams
5. **Test federation integration** - unit tests aren't enough; test loaded remotes
6. **Document exposed modules** - each remote's `exposes` config is its public API
