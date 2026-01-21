import type { ReactElement, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAppStore from '@stores/useAppStore';
import { LoadingSpinner } from '@components/common';

export interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/** Route guard for authenticated users */
export function ProtectedRoute({
  children,
  redirectTo = '/login',
}: ProtectedRouteProps): ReactElement {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAppStore();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
