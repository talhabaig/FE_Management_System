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
