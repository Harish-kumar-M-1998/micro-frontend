import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'user';
}

/**
 * Route guard that redirects unauthenticated users to login.
 * Optionally enforces role-based access control (RBAC).
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user) {
    const roleHierarchy: Record<'admin' | 'manager' | 'user', number> = {
      admin: 3,
      manager: 2,
      user: 1,
    };
    if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
