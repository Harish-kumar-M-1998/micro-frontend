/**
 * Secure token storage abstraction.
 * Uses sessionStorage for access tokens (cleared on tab close)
 * and localStorage for refresh tokens with encryption-ready interface.
 *
 * Security: Never store tokens in cookies without HttpOnly flag from server.
 * For production, consider httpOnly cookies set by backend.
 */
const ACCESS_TOKEN_KEY = 'mfe_access_token';
const REFRESH_TOKEN_KEY = 'mfe_refresh_token';
const USER_KEY = 'mfe_user';

export const tokenStorage = {
  getAccessToken(): string | null {
    try {
      return sessionStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setAccessToken(token: string): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  getUser<T>(): T | null {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  setUser<T>(user: T): void {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearAll(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
