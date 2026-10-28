import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../lib/session';

/** Route guard. Unauthenticated users go to /login. While the session hydrates from /auth/me, show nothing. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
