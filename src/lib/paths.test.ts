import { describe, expect, it } from 'vitest';
import { paths, readNotice, readRedirect, readRegistered, tasksPathFromDashboard } from './paths';

describe('paths', () => {
  it('builds resource paths from ids', () => {
    // Arrange
    const id = 'abc-123';

    // Act
    const taskPath = paths.task(id);
    const teamPath = paths.team(id);
    const userPath = paths.user(id);

    // Assert
    expect(taskPath).toBe('/tasks/abc-123');
    expect(teamPath).toBe('/teams/abc-123');
    expect(userPath).toBe('/users/abc-123');
  });

  it('maps a dashboard card to a filtered tasks URL', () => {
    // Arrange
    const values = {
      status: '',
      priority: 'LOW',
      teamId: 'team-1',
      assignedToId: '',
      deadlineFrom: '',
      deadlineTo: '',
    };

    // Act
    const todoPath = tasksPathFromDashboard(values, 'todo');
    const highPath = tasksPathFromDashboard(values, 'highPriority');
    const totalPath = tasksPathFromDashboard({ ...values, priority: '' }, 'total');

    // Assert
    expect(todoPath).toContain('/tasks?');
    expect(todoPath).toContain('status=TODO');
    expect(todoPath).toContain('priority=LOW');
    expect(todoPath).toContain('teamId=team-1');
    expect(highPath).toContain('priority=HIGH');
    expect(totalPath).toBe('/tasks?teamId=team-1');
  });

  it('reads a safe in-app redirect and rejects unsafe ones', () => {
    // Arrange
    const safe = { from: { pathname: '/tasks' } };
    const external = { from: { pathname: '//evil.example' } };
    const missing = { hello: true };

    // Act
    const safePath = readRedirect(safe);
    const blocked = readRedirect(external);
    const fallback = readRedirect(missing);

    // Assert
    expect(safePath).toBe('/tasks');
    expect(blocked).toBe(paths.dashboard);
    expect(fallback).toBe(paths.dashboard);
  });

  it('reads notice and registered flags from router state', () => {
    // Arrange
    const noticeState = { notice: 'Team created.' };
    const registeredState = { registered: true };

    // Act
    const notice = readNotice(noticeState);
    const emptyNotice = readNotice({});
    const registered = readRegistered(registeredState);
    const notRegistered = readRegistered({ registered: false });

    // Assert
    expect(notice).toBe('Team created.');
    expect(emptyNotice).toBeNull();
    expect(registered).toBe(true);
    expect(notRegistered).toBe(false);
  });
});
