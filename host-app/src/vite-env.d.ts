/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DASHBOARD_REMOTE: string;
  readonly VITE_USER_REMOTE: string;
  readonly VITE_REPORTS_REMOTE: string;
  readonly VITE_LOG_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
