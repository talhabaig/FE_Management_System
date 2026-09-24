export const paths = {
  login: '/login',
  register: '/register',
  dashboard: '/',
  tasks: '/tasks',
  newTask: '/tasks/new',
  task: (id: string) => `/tasks/${id}`,
  teams: '/teams',
  newTeam: '/teams/new',
  team: (id: string) => `/teams/${id}`,
  users: '/users',
  user: (id: string) => `/users/${id}`,
  notifications: '/notifications',
  profile: '/profile',
} as const;

export type DashboardCardKey = 'total' | 'todo' | 'inProgress' | 'done' | 'highPriority' | 'overdue';

/** Build a /tasks URL that mirrors the current dashboard filters plus a card focus. */
export function tasksPathFromDashboard(
  values: {
    status: string;
    priority: string;
    teamId: string;
    assignedToId: string;
    deadlineFrom: string;
    deadlineTo: string;
  },
  focus: DashboardCardKey,
): string {
  const params = new URLSearchParams();
  if (values.teamId) {
    params.set('teamId', values.teamId);
  }
  if (values.assignedToId) {
    params.set('assignedToId', values.assignedToId);
  }
  if (values.deadlineFrom) {
    params.set('deadlineFrom', values.deadlineFrom);
  }
  if (values.deadlineTo) {
    params.set('deadlineTo', values.deadlineTo);
  }

  switch (focus) {
    case 'todo':
      params.set('status', 'TODO');
      if (values.priority) {
        params.set('priority', values.priority);
      }
      break;
    case 'inProgress':
      params.set('status', 'IN_PROGRESS');
      if (values.priority) {
        params.set('priority', values.priority);
      }
      break;
    case 'done':
      params.set('status', 'DONE');
      if (values.priority) {
        params.set('priority', values.priority);
      }
      break;
    case 'highPriority':
      params.set('priority', 'HIGH');
      if (values.status) {
        params.set('status', values.status);
      }
      break;
    case 'overdue': {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      params.set('deadlineTo', `${yyyy}-${mm}-${dd}`);
      params.set('sortBy', 'deadline');
      params.set('sortOrder', 'asc');
      if (values.priority) {
        params.set('priority', values.priority);
      }
      break;
    }
    case 'total':
    default:
      if (values.status) {
        params.set('status', values.status);
      }
      if (values.priority) {
        params.set('priority', values.priority);
      }
      break;
  }

  const query = params.toString();
  return query ? `${paths.tasks}?${query}` : paths.tasks;
}

export function encodeId(id: string): string {
  return encodeURIComponent(id);
}

export function readRedirect(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('from' in state)) {
    return paths.dashboard;
  }
  const from = state.from;
  if (typeof from !== 'object' || from === null || !('pathname' in from) || typeof from.pathname !== 'string') {
    return paths.dashboard;
  }
  if (!from.pathname.startsWith('/') || from.pathname.startsWith('//')) {
    return paths.dashboard;
  }
  return from.pathname;
}

export function readNotice(state: unknown): string | null {
  if (typeof state === 'object' && state !== null && 'notice' in state && typeof state.notice === 'string') {
    return state.notice;
  }
  return null;
}

export function readRegistered(state: unknown): boolean {
  return typeof state === 'object' && state !== null && 'registered' in state && state.registered === true;
}
