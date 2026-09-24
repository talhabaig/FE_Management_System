import type {
  DashboardFilters,
  PaginationParams,
  TaskListFilters,
  TeamListFilters,
  UserListFilters,
} from '../types/api';

export const queryKeys = {
  auth: {
    all: () => ['auth'] as const,
    me: () => ['auth', 'me'] as const,
  },
  users: {
    all: () => ['users'] as const,
    list: (filters: UserListFilters) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  teams: {
    all: () => ['teams'] as const,
    list: (filters: TeamListFilters) => ['teams', 'list', filters] as const,
    detail: (id: string) => ['teams', 'detail', id] as const,
    members: (teamId: string, filters: PaginationParams) => ['teams', teamId, 'members', filters] as const,
  },
  tasks: {
    all: () => ['tasks'] as const,
    list: (filters: TaskListFilters) => ['tasks', 'list', filters] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
  },
  comments: {
    all: () => ['comments'] as const,
    list: (taskId: string, filters: PaginationParams) => ['comments', taskId, filters] as const,
  },
  notifications: {
    all: () => ['notifications'] as const,
    list: (filters: PaginationParams) => ['notifications', 'list', filters] as const,
  },
  dashboard: {
    all: () => ['dashboard'] as const,
    summary: (filters: DashboardFilters) => ['dashboard', 'summary', filters] as const,
  },
} as const;
