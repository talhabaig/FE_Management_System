import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '../components/layout/AsyncState';
import { useMe } from '../hooks/useAuth';
import { paths } from '../lib/paths';
import type { Role } from '../types/api';

export function SessionGate() {
  const me = useMe();

  if (me.isPending) {
    return (
      <div className="grid min-h-screen place-items-center">
        <LoadingState label="Restoring session" />
      </div>
    );
  }

  // Restore failures (including refresh/me 429) must not look like login lockout — continue to Login.
  return <Outlet />;
}

export function RequireAuth() {
  const me = useMe();
  const location = useLocation();

  if (!me.data) {
    return <Navigate to={paths.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function GuestOnly() {
  const me = useMe();

  if (me.data) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return <Outlet />;
}

export function RequireRole({ roles }: { roles: Role[] }) {
  const me = useMe();

  if (!me.data || !roles.includes(me.data.role)) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return <Outlet />;
}
