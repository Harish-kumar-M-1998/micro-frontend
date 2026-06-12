/**
 * Demo mode works in local dev OR when VITE_DEMO_MODE=true is set at build time.
 * Set VITE_DEMO_MODE=true on Netlify until you have a real backend API.
 */
export function isDemoMode(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true';
}
