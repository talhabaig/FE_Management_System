import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useLogout, useMe } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { roleBadgeVariant, roleLabel } from '../../lib/labels';
import { OPTION_PAGE_SIZE } from '../../lib/params';
import { paths } from '../../lib/paths';
import { canViewUsers } from '../../lib/permissions';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ErrorBoundary } from './ErrorBoundary';

function IconDashboard({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11" y="2.5" width="6.5" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11" y="9.5" width="6.5" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="2.5" y="11.5" width="6.5" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconTasks({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="3.5" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 8h7M6.5 12h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6.5 8l1.2 1.2L9.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTeams({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="2.25" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="13.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.5 15.5c.4-2.2 2.1-3.5 3.5-3.5s3.1 1.3 3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M11 15.5c.3-1.7 1.5-2.8 2.5-2.8 1.1 0 2.2 1 2.5 2.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="7" r="2.75" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4.5 16c.6-2.6 2.7-4 5.5-4s4.9 1.4 5.5 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconBell({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 3.5a4.5 4.5 0 0 1 4.5 4.5v2.2l1.1 2.1H4.4l1.1-2.1V8A4.5 4.5 0 0 1 10 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8.2 15.5a1.9 1.9 0 0 0 3.6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconProfile({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="10" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.2 14.2c.8-1.5 2.1-2.2 3.8-2.2s3 0.7 3.8 2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const iconMap = {
  Dashboard: IconDashboard,
  Tasks: IconTasks,
  Teams: IconTeams,
  Users: IconUsers,
  Notifications: IconBell,
  Profile: IconProfile,
} as const;

type NavItem = {
  to: string;
  label: keyof typeof iconMap;
  end?: boolean;
  badge?: number;
};

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
    isActive
      ? 'bg-moss/10 text-moss before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-moss'
      : 'text-ink/70 hover:bg-sand/80 hover:text-ink',
  ].join(' ');
}

function NavItemLink({ item }: { item: NavItem }) {
  const Icon = iconMap[item.label];

  return (
    <NavLink to={item.to} end={item.end} className={navClass}>
      <Icon className="h-4 w-4 shrink-0 opacity-80" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge && item.badge > 0 ? (
        <span className="rounded-md bg-clay px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      ) : null}
    </NavLink>
  );
}

function MobileNavItem({ item }: { item: NavItem }) {
  const Icon = iconMap[item.label];

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        [
          'relative flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition',
          isActive ? 'bg-pine text-white' : 'bg-card text-ink/75 ring-1 ring-sand hover:bg-sand/60 hover:text-ink',
        ].join(' ')
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
      {item.badge && item.badge > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">
          {item.badge > 9 ? '9+' : item.badge}
        </span>
      ) : null}
    </NavLink>
  );
}

function SidebarBrand() {
  return (
    <div className="border-b border-sand px-5 py-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-clay">Workbench</p>
      <p className="mt-1 font-display text-[1.65rem] leading-none text-ink">Task Management</p>
    </div>
  );
}

function NavSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/40">{title}</p>
      {children}
    </div>
  );
}

export function AppShell() {
  const me = useMe();
  const logout = useLogout();
  const notifications = useNotifications({ page: 1, limit: OPTION_PAGE_SIZE });
  const user = me.data;
  const unreadOnPage = notifications.data?.data.filter((item) => !item.isRead).length ?? 0;
  const mayHaveMoreUnread = Boolean(notifications.data?.pagination.hasNextPage && unreadOnPage >= OPTION_PAGE_SIZE);
  const unread = mayHaveMoreUnread ? OPTION_PAGE_SIZE : unreadOnPage;

  if (!user) {
    return null;
  }

  const primaryLinks: NavItem[] = [
    { to: paths.dashboard, label: 'Dashboard', end: true },
    { to: paths.tasks, label: 'Tasks' },
    { to: paths.teams, label: 'Teams' },
    ...(canViewUsers(user.role) ? [{ to: paths.users, label: 'Users' as const }] : []),
  ];

  const accountLinks: NavItem[] = [
    { to: paths.notifications, label: 'Notifications', badge: unread },
    { to: paths.profile, label: 'Profile' },
  ];

  const mobileLinks = [...primaryLinks, ...accountLinks];

  return (
    <ErrorBoundary>
      <div className="min-h-screen md:grid md:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden border-r border-sand bg-[#f7f3ea] md:flex md:flex-col">
          <SidebarBrand />

          <div className="flex flex-1 flex-col gap-6 px-3 py-5">
            <NavSection title="Menu">
              <nav aria-label="Primary" className="space-y-1">
                {primaryLinks.map((link) => (
                  <NavItemLink key={link.to} item={link} />
                ))}
              </nav>
            </NavSection>

            <NavSection title="Account">
              <nav aria-label="Account" className="space-y-1">
                {accountLinks.map((link) => (
                  <NavItemLink key={link.to} item={link} />
                ))}
              </nav>
            </NavSection>
          </div>

          <div className="mt-auto border-t border-sand p-4">
            <div className="rounded-2xl bg-card p-3 ring-1 ring-sand">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                  <p className="truncate text-xs text-ink/55">{user.email}</p>
                </div>
                <Badge variant={roleBadgeVariant(user.role)}>{roleLabel(user.role)}</Badge>
              </div>
              <div className="mt-3">
                <Button type="button" variant="secondary" fullWidth isLoading={logout.isPending} onClick={() => logout.mutate()}>
                  Log out
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-sand bg-card/90 px-4 py-4 backdrop-blur sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3 md:hidden">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-clay">Workbench</p>
                <p className="font-display text-2xl leading-none text-ink">Task Management</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={roleBadgeVariant(user.role)}>{roleLabel(user.role)}</Badge>
                <Button type="button" variant="secondary" isLoading={logout.isPending} onClick={() => logout.mutate()}>
                  Log out
                </Button>
              </div>
            </div>

            <div className="hidden items-center justify-between gap-4 md:flex">
              <div>
                <p className="text-sm text-ink/60">Signed in as</p>
                <p className="font-semibold text-ink">{user.name}</p>
              </div>
              <Badge variant={roleBadgeVariant(user.role)}>{roleLabel(user.role)}</Badge>
            </div>

            <nav aria-label="Primary mobile" className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
              {mobileLinks.map((link) => (
                <MobileNavItem key={link.to} item={link} />
              ))}
            </nav>
          </header>

          <main className="px-4 py-8 sm:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
