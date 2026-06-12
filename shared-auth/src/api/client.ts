import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import type { ApiError } from '../types';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/** Endpoints that should not trigger token refresh */
const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/logout'];

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(error: AxiosError, retryCount: number): boolean {
  if (retryCount >= MAX_RETRIES) return false;
  const status = error.response?.status;
  // Retry on network errors or 5xx server errors
  return !status || (status >= 500 && status < 600);
}

/**
 * Creates configured Axios instance with:
 * - Auth header injection
 * - Automatic token refresh on 401
 * - Retry logic for transient failures
 * - Centralized error normalization
 */
export function createApiClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    withCredentials: true, // Enable CSRF cookie transmission
  });

  // Request interceptor: attach JWT
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenStorage.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor: refresh + retry
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
        _retryCount?: number;
      };

      if (!originalRequest) {
        return Promise.reject(normalizeError(error));
      }

      const retryCount = originalRequest._retryCount ?? 0;

      // Token refresh on 401
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !AUTH_ENDPOINTS.some((ep) => originalRequest.url?.includes(ep))
      ) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(client(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = tokenStorage.getRefreshToken();
          if (!refreshToken) throw new Error('No refresh token');

          const { data } = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken,
          });

          tokenStorage.setAccessToken(data.accessToken);
          if (data.refreshToken) {
            tokenStorage.setRefreshToken(data.refreshToken);
          }

          onTokenRefreshed(data.accessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          }

          return client(originalRequest);
        } catch (refreshError) {
          tokenStorage.clearAll();
          window.dispatchEvent(new CustomEvent('mfe:auth:logout'));
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Retry logic for transient errors
      if (shouldRetry(error, retryCount)) {
        originalRequest._retryCount = retryCount + 1;
        await sleep(RETRY_DELAY_MS * (retryCount + 1));
        return client(originalRequest);
      }

      return Promise.reject(normalizeError(error));
    },
  );

  return client;
}

function normalizeError(error: AxiosError): ApiError {
  const response = error.response;
  const data = response?.data as { message?: string; code?: string } | undefined;

  return {
    message: data?.message ?? error.message ?? 'An unexpected error occurred',
    code: data?.code ?? 'UNKNOWN_ERROR',
    status: response?.status ?? 0,
  };
}

/** Default API client - base URL from environment */
export const apiClient = createApiClient(
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api',
);
