import { encodeId } from './paths';

export const endpoints = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  users: {
    list: '/api/users',
    byId: (id: string) => `/api/users/${encodeId(id)}`,
  },
  teams: {
    list: '/api/teams',
    byId: (id: string) => `/api/teams/${encodeId(id)}`,
    members: (id: string) => `/api/teams/${encodeId(id)}/members`,
    member: (teamId: string, userId: string) => `/api/teams/${encodeId(teamId)}/members/${encodeId(userId)}`,
  },
  tasks: {
    list: '/api/tasks',
    byId: (id: string) => `/api/tasks/${encodeId(id)}`,
    assign: (id: string) => `/api/tasks/${encodeId(id)}/assign`,
    status: (id: string) => `/api/tasks/${encodeId(id)}/status`,
    comments: (taskId: string) => `/api/tasks/${encodeId(taskId)}/comments`,
  },
  comments: {
    byId: (id: string) => `/api/comments/${encodeId(id)}`,
  },
  notifications: {
    list: '/api/notifications',
    read: (id: string) => `/api/notifications/${encodeId(id)}/read`,
    readAll: '/api/notifications/read-all',
  },
  dashboard: {
    summary: '/api/dashboard/summary',
  },
} as const;
