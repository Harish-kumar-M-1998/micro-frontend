import { apiClient } from '../api/client';
import { tokenStorage } from '../utils/tokenStorage';
import type { AuthTokens, AuthUser, LoginCredentials } from '../types';

/** Mock demo credentials for local development */
const DEMO_USER: AuthUser = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
};

/**
 * Authentication service handling login, logout, and token refresh.
 * In production, all auth flows go through secure backend endpoints.
 */
export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    // Demo mode: accept any credentials with valid email format
    if (import.meta.env.DEV) {
      await simulateDelay(500);
      if (!credentials.email.includes('@')) {
        throw { message: 'Invalid email format', code: 'VALIDATION_ERROR', status: 400 };
      }

      const tokens: AuthTokens = {
        accessToken: `demo-access-${Date.now()}`,
        refreshToken: `demo-refresh-${Date.now()}`,
        expiresIn: 3600,
      };

      tokenStorage.setAccessToken(tokens.accessToken);
      tokenStorage.setRefreshToken(tokens.refreshToken);
      tokenStorage.setUser({ ...DEMO_USER, email: credentials.email });

      return { user: { ...DEMO_USER, email: credentials.email }, tokens };
    }

    const { data } = await apiClient.post('/auth/login', credentials);
    tokenStorage.setAccessToken(data.tokens.accessToken);
    tokenStorage.setRefreshToken(data.tokens.refreshToken);
    tokenStorage.setUser(data.user);
    return data;
  },

  async logout(): Promise<void> {
    try {
      if (!import.meta.env.DEV) {
        await apiClient.post('/auth/logout');
      }
    } finally {
      tokenStorage.clearAll();
    }
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    tokenStorage.setAccessToken(data.accessToken);
    if (data.refreshToken) {
      tokenStorage.setRefreshToken(data.refreshToken);
    }
    return data;
  },

  getStoredUser(): AuthUser | null {
    return tokenStorage.getUser<AuthUser>();
  },

  isAuthenticated(): boolean {
    return !!tokenStorage.getAccessToken();
  },
};

function simulateDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
