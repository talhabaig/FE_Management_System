import { NavLink, Outlet } from 'react-router-dom';
import { useLogout, useMe } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { roleBadgeVariant, roleLabel } from '../../lib/labels';
import { paths } from '../../lib/paths';
import { canViewUsers } from '../../lib/permissions';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ErrorBoundary } from './ErrorBoundary';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-semibold transition',
    isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white',
  ].join(' ');

export function AppShell() {
  const me = useMe();
  const logout = useLogout();
  const notifications = useNotifications({ page: 1, limit: 20 });
  const user = me.data;
  const unread = notifications.data?.data.filter((item) => !item.isRead).length ?? 0;

  if (!user) {
    return null;
  }

  const links = [
    { to: paths.dashboard, label: 'Dashboard' },
    { to: paths.tasks, label: 'Tasks' },
    { to: paths.teams, label: 'Teams' },
    ...(canViewUsers(user.role) ? [{ to: paths.users, label: 'Users' }] : []),
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen md:grid md:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="bg-pine text-white">
          <div className="flex items-center justify-between px-5 py-5 md:block">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Workbench</p>
              <p className="font-display text-2xl">Task Management</p>
            </div>
          </div>
          <nav aria-label="Primary" className="flex gap-2 overflow-x-auto px-3 pb-4 md:block md:space-y-1 md:px-3">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === paths.dashboard}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-sand bg-card/80 px-4 py-4 sm:px-8">
            <div>
              <p className="font-semibold text-ink">{user.name}</p>
              <p className="text-sm text-ink/65">{user.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={roleBadgeVariant(user.role)}>{roleLabel(user.role)}</Badge>
              <NavLink
                to={paths.notifications}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-sand/70"
              >
                Notifications{unread > 0 ? ` (${unread} unread)` : ''}
              </NavLink>
              <NavLink to={paths.profile} className="rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-sand/70">
                Profile
              </NavLink>
              <Button type="button" variant="secondary" isLoading={logout.isPending} onClick={() => logout.mutate()}>
                Log out
              </Button>
            </div>
          </header>
          <main className="px-4 py-8 sm:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
