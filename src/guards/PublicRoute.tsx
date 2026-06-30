import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_REDIRECT_MAP } from '../types/auth';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Guard for public pages (login).
 * If the user is already authenticated, redirect to their panel.
 */
export function PublicRoute({ children }: PublicRouteProps) {
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

  if (isAuthenticated && user) {
    const redirectPath = ROLE_REDIRECT_MAP[user.role];
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
