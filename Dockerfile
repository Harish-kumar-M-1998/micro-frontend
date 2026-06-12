# =============================================================================
# Multi-stage Dockerfile for Microfrontend Host Application
# Each remote MFE has an identical Dockerfile with APP_NAME changed
# =============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root files
COPY package.json package-lock.json* ./
COPY host-app/package.json ./host-app/
COPY dashboard-app/package.json ./dashboard-app/
COPY user-app/package.json ./user-app/
COPY reports-app/package.json ./reports-app/
COPY shared-ui/package.json ./shared-ui/
COPY shared-auth/package.json ./shared-auth/

RUN npm ci --workspace=host-app --include-workspace-root

# Copy source
COPY tsconfig.base.json ./
COPY host-app/ ./host-app/
COPY dashboard-app/ ./dashboard-app/
COPY user-app/ ./user-app/
COPY reports-app/ ./reports-app/
COPY shared-ui/ ./shared-ui/
COPY shared-auth/ ./shared-auth/

# Build all apps
ARG VITE_DASHBOARD_REMOTE=http://dashboard:5001/assets/remoteEntry.js
ARG VITE_USER_REMOTE=http://user:5002/assets/remoteEntry.js
ARG VITE_REPORTS_REMOTE=http://reports:5003/assets/remoteEntry.js

ENV VITE_DASHBOARD_REMOTE=$VITE_DASHBOARD_REMOTE
ENV VITE_USER_REMOTE=$VITE_USER_REMOTE
ENV VITE_REPORTS_REMOTE=$VITE_REPORTS_REMOTE

RUN npm run build -w dashboard-app && \
    npm run build -w user-app && \
    npm run build -w reports-app && \
    npm run build -w host-app

# Stage 2: Production nginx server
FROM nginx:1.27-alpine AS production

# Security: non-root user
RUN addgroup -g 1001 -S mfe && adduser -S mfe -u 1001 -G mfe

# Security headers
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/security-headers.conf /etc/nginx/conf.d/security-headers.conf

COPY --from=builder /app/host-app/dist /usr/share/nginx/html

RUN chown -R mfe:mfe /usr/share/nginx/html /var/cache/nginx /var/log/nginx && \
    touch /var/run/nginx.pid && chown mfe:mfe /var/run/nginx.pid

USER mfe
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
