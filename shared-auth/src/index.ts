export { createAppStore, getStore, setStore } from './store';
export type { AppStore, RootState, AppDispatch } from './store';

export { default as authReducer, login, logout, clearAuthError, setUser, restoreSession } from './store/slices/authSlice';
export { default as userReducer, fetchUsers, fetchUserById, selectUser, clearUserError } from './store/slices/userSlice';
export { default as themeReducer, setThemeMode, toggleTheme } from './store/slices/themeSlice';

export { useAppDispatch, useAppSelector } from './hooks/useAppStore';

export { authService } from './services/auth.service';
export { userService } from './services/user.service';
export { reportService } from './services/report.service';

export { apiClient, createApiClient } from './api/client';
export { tokenStorage } from './utils/tokenStorage';

export { eventBus, MFE_EVENTS, dispatchMfeEvent, listenMfeEvent } from './events/eventBus';
export { monitoring, reportErrorBoundary } from './monitoring';

export { ProtectedRoute } from './components/ProtectedRoute';
export { LoginForm } from './components/LoginForm';

export type * from './types';
