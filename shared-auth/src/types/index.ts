/** JWT payload shape returned from auth API */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UserProfile extends AuthUser {
  department?: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface ReportSummary {
  id: string;
  title: string;
  type: 'sales' | 'analytics' | 'compliance';
  generatedAt: string;
  status: 'ready' | 'processing' | 'failed';
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface MfeEvent<T = unknown> {
  type: string;
  payload: T;
  source: string;
  timestamp: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
}

export interface UserState {
  users: UserProfile[];
  selectedUser: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}
