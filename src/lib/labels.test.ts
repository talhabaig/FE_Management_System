import { describe, expect, it } from 'vitest';
import {
  notificationTypeLabel,
  priorityBadgeVariant,
  roleBadgeVariant,
  roleLabel,
  statusBadgeVariant,
  taskPriorityLabel,
  taskStatusLabel,
} from './labels';

describe('labels', () => {
  it('maps roles, statuses, and priorities to display text', () => {
    // Arrange / Act / Assert
    expect(roleLabel('ADMIN')).toBe('Admin');
    expect(roleLabel('MANAGER')).toBe('Manager');
    expect(roleLabel('USER')).toBe('User');
    expect(taskStatusLabel('TODO')).toBe('To do');
    expect(taskStatusLabel('IN_PROGRESS')).toBe('In progress');
    expect(taskStatusLabel('DONE')).toBe('Done');
    expect(taskPriorityLabel('LOW')).toBe('Low');
    expect(taskPriorityLabel('MEDIUM')).toBe('Medium');
    expect(taskPriorityLabel('HIGH')).toBe('High');
  });

  it('maps domain values to badge variants', () => {
    // Arrange / Act / Assert
    expect(roleBadgeVariant('ADMIN')).toBe('danger');
    expect(roleBadgeVariant('MANAGER')).toBe('warning');
    expect(statusBadgeVariant('DONE')).toBe('success');
    expect(statusBadgeVariant('IN_PROGRESS')).toBe('info');
    expect(priorityBadgeVariant('HIGH')).toBe('danger');
    expect(priorityBadgeVariant('MEDIUM')).toBe('warning');
  });

  it('labels notification types', () => {
    // Arrange / Act / Assert
    expect(notificationTypeLabel('TASK_ASSIGNED')).toBe('Task assigned');
    expect(notificationTypeLabel('TASK_STATUS_UPDATED')).toBe('Status updated');
  });
});
