import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, ROLE_REDIRECT_MAP } from '../types/auth';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

/**
 * Route guard that enforces authentication and role-based access.
 *
 * - If not authenticated → redirect to /login
 * - If authenticated but wrong role → redirect to user's correct panel
 * - If authenticated and authorized → render children
 */
export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const correctPath = ROLE_REDIRECT_MAP[user.role];
    return <Navigate to={correctPath} replace />;
  }

  return <>{children}</>;
}
