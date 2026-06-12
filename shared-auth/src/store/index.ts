import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import themeReducer from './slices/themeSlice';

/**
 * Central Redux store shared across all microfrontends.
 * Host app creates this store; remotes consume via Module Federation shared singleton.
 */
export function createAppStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      user: userReducer,
      theme: themeReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST'],
        },
      }),
    devTools: import.meta.env.DEV,
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

/** Singleton store instance for cross-MFE access */
let storeInstance: AppStore | null = null;

export function getStore(): AppStore {
  if (!storeInstance) {
    storeInstance = createAppStore();
  }
  return storeInstance;
}

export function setStore(store: AppStore): void {
  storeInstance = store;
}
