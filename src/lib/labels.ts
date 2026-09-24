import type { BadgeVariant } from '../components/ui/Badge';
import type { Role, TaskPriority, TaskStatus } from '../types/api';

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'To do' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' },
];

export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'USER', label: 'User' },
];

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created date' },
  { value: 'updatedAt', label: 'Updated date' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'title', label: 'Title' },
];

export const SORT_ORDER_OPTIONS = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' },
];

export function roleLabel(role: Role): string {
  if (role === 'ADMIN') return 'Admin';
  if (role === 'MANAGER') return 'Manager';
  return 'User';
}

export function taskStatusLabel(status: TaskStatus): string {
  if (status === 'TODO') return 'To do';
  if (status === 'IN_PROGRESS') return 'In progress';
  return 'Done';
}

export function taskPriorityLabel(priority: TaskPriority): string {
  if (priority === 'LOW') return 'Low';
  if (priority === 'HIGH') return 'High';
  return 'Medium';
}

export function roleBadgeVariant(role: Role): BadgeVariant {
  if (role === 'ADMIN') return 'danger';
  if (role === 'MANAGER') return 'warning';
  return 'neutral';
}

export function statusBadgeVariant(status: TaskStatus): BadgeVariant {
  if (status === 'DONE') return 'success';
  if (status === 'IN_PROGRESS') return 'info';
  return 'neutral';
}

export function priorityBadgeVariant(priority: TaskPriority): BadgeVariant {
  if (priority === 'HIGH') return 'danger';
  if (priority === 'MEDIUM') return 'warning';
  return 'neutral';
}

export function notificationTypeLabel(type: 'TASK_ASSIGNED' | 'TASK_STATUS_UPDATED'): string {
  if (type === 'TASK_ASSIGNED') return 'Task assigned';
  return 'Status updated';
}
