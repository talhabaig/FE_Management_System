import type { Role, SortOrder, TaskPriority, TaskSortField, TaskStatus } from '../types/api';

export const PAGE_SIZE = 20;
export const OPTION_PAGE_SIZE = 100;

const SORT_FIELDS: readonly TaskSortField[] = ['createdAt', 'updatedAt', 'deadline', 'priority', 'status', 'title'];
const SORT_ORDERS: readonly SortOrder[] = ['asc', 'desc'];
const STATUSES: readonly TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITIES: readonly TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];
const ROLES: readonly Role[] = ['ADMIN', 'MANAGER', 'USER'];

export function readPositiveInt(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100_000) {
    return fallback;
  }
  return parsed;
}

export function isTaskStatus(value: string): value is TaskStatus {
  return (STATUSES as readonly string[]).includes(value);
}

export function isTaskPriority(value: string): value is TaskPriority {
  return (PRIORITIES as readonly string[]).includes(value);
}

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function isSortField(value: string): value is TaskSortField {
  return (SORT_FIELDS as readonly string[]).includes(value);
}

export function isSortOrder(value: string): value is SortOrder {
  return (SORT_ORDERS as readonly string[]).includes(value);
}

export function readOptional(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function startOfDayIso(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1, 0, 0, 0, 0).toISOString();
}

export function endOfDayIso(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1, 23, 59, 59, 999).toISOString();
}

export function isDateRangeInvalid(from: string | undefined, to: string | undefined): boolean {
  if (!from || !to) {
    return false;
  }
  return from > to;
}
