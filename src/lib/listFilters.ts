import type { DashboardFilters, Role, TaskListFilters } from '../types/api';
import {
  PAGE_SIZE,
  endOfDayIso,
  isDateRangeInvalid,
  isRole,
  isSortField,
  isSortOrder,
  isTaskPriority,
  isTaskStatus,
  readOptional,
  readPositiveInt,
  startOfDayIso,
} from './params';

export interface DashboardFilterState {
  filters: DashboardFilters;
  values: {
    status: string;
    priority: string;
    teamId: string;
    assignedToId: string;
    deadlineFrom: string;
    deadlineTo: string;
  };
  dateError?: string;
}

export function readDashboardFilters(params: URLSearchParams): DashboardFilterState {
  const status = params.get('status') ?? '';
  const priority = params.get('priority') ?? '';
  const teamId = readOptional(params.get('teamId'));
  const assignedToId = readOptional(params.get('assignedToId'));
  const deadlineFrom = readOptional(params.get('deadlineFrom'));
  const deadlineTo = readOptional(params.get('deadlineTo'));
  const dateError = isDateRangeInvalid(deadlineFrom, deadlineTo)
    ? 'deadlineFrom must be before or equal to deadlineTo'
    : undefined;

  const filters: DashboardFilters = {};
  if (isTaskStatus(status)) {
    filters.status = status;
  }
  if (isTaskPriority(priority)) {
    filters.priority = priority;
  }
  if (teamId) {
    filters.teamId = teamId;
  }
  if (assignedToId) {
    filters.assignedToId = assignedToId;
  }
  if (!dateError && deadlineFrom) {
    filters.deadlineFrom = startOfDayIso(deadlineFrom);
  }
  if (!dateError && deadlineTo) {
    filters.deadlineTo = endOfDayIso(deadlineTo);
  }

  return {
    filters,
    dateError,
    values: {
      status: isTaskStatus(status) ? status : '',
      priority: isTaskPriority(priority) ? priority : '',
      teamId: teamId ?? '',
      assignedToId: assignedToId ?? '',
      deadlineFrom: deadlineFrom ?? '',
      deadlineTo: deadlineTo ?? '',
    },
  };
}

export interface TaskFilterState {
  filters: TaskListFilters;
  values: {
    status: string;
    priority: string;
    teamId: string;
    assignedToId: string;
    deadlineFrom: string;
    deadlineTo: string;
    sortBy: string;
    sortOrder: string;
  };
  dateError?: string;
}

export function readTaskFilters(params: URLSearchParams): TaskFilterState {
  const dashboard = readDashboardFilters(params);
  const sortByValue = params.get('sortBy') ?? '';
  const sortOrderValue = params.get('sortOrder') ?? '';
  const search = readOptional(params.get('search'));
  const filters: TaskListFilters = {
    page: readPositiveInt(params.get('page'), 1),
    limit: PAGE_SIZE,
    sortBy: isSortField(sortByValue) ? sortByValue : 'createdAt',
    sortOrder: isSortOrder(sortOrderValue) ? sortOrderValue : 'desc',
    ...dashboard.filters,
  };
  if (search) {
    filters.search = search;
  }

  return {
    filters,
    dateError: dashboard.dateError,
    values: {
      ...dashboard.values,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    },
  };
}

export function readUserFilters(params: URLSearchParams): { page: number; limit: number; search?: string; role?: Role } {
  const search = readOptional(params.get('search'));
  const roleValue = params.get('role') ?? '';
  return {
    page: readPositiveInt(params.get('page'), 1),
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(isRole(roleValue) ? { role: roleValue } : {}),
  };
}

export function readTeamFilters(params: URLSearchParams): { page: number; limit: number; search?: string } {
  const search = readOptional(params.get('search'));
  return {
    page: readPositiveInt(params.get('page'), 1),
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
  };
}

export function replaceParam(current: URLSearchParams, key: string, value: string, resetPage = true): URLSearchParams {
  const next = new URLSearchParams(current);
  if (value) {
    next.set(key, value);
  } else {
    next.delete(key);
  }
  if (resetPage) {
    next.delete('page');
  }
  return next;
}
