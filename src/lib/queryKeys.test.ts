import { describe, expect, it } from 'vitest';
import { queryKeys } from './queryKeys';

describe('queryKeys', () => {
  it('builds stable list and detail keys', () => {
    // Arrange
    const filters = { page: 1, limit: 20, search: 'ada' };

    // Act
    const users = queryKeys.users.list(filters);
    const task = queryKeys.tasks.detail('task-1');
    const auth = queryKeys.auth.me();

    // Assert
    expect(users).toEqual(['users', 'list', filters]);
    expect(task).toEqual(['tasks', 'detail', 'task-1']);
    expect(auth).toEqual(['auth', 'me']);
  });
});
