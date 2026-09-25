import { describe, expect, it } from 'vitest';
import { PAGE_SIZE } from './params';
import { readDashboardFilters, readTaskFilters, readTeamFilters, readUserFilters, replaceParam } from './listFilters';

describe('listFilters', () => {
  it('reads valid dashboard filters and ignores unknown values', () => {
    // Arrange
    const params = new URLSearchParams('status=TODO&priority=NOPE&teamId=team-1');

    // Act
    const state = readDashboardFilters(params);

    // Assert
    expect(state.filters.status).toBe('TODO');
    expect(state.filters.priority).toBeUndefined();
    expect(state.filters.teamId).toBe('team-1');
    expect(state.values.priority).toBe('');
    expect(state.dateError).toBeUndefined();
  });

  it('sets a date error when the deadline range is inverted', () => {
    // Arrange
    const params = new URLSearchParams('deadlineFrom=2026-09-26&deadlineTo=2026-09-25');

    // Act
    const state = readDashboardFilters(params);

    // Assert
    expect(state.dateError).toBe('deadlineFrom must be before or equal to deadlineTo');
    expect(state.filters.deadlineFrom).toBeUndefined();
    expect(state.filters.deadlineTo).toBeUndefined();
  });

  it('reads task filters with defaults for sort and paging', () => {
    // Arrange
    const params = new URLSearchParams('search=auth&page=2&sortBy=deadline&sortOrder=asc');

    // Act
    const state = readTaskFilters(params);

    // Assert
    expect(state.filters.search).toBe('auth');
    expect(state.filters.page).toBe(2);
    expect(state.filters.limit).toBe(PAGE_SIZE);
    expect(state.filters.sortBy).toBe('deadline');
    expect(state.filters.sortOrder).toBe('asc');
    expect(state.values.sortBy).toBe('deadline');
  });

  it('reads user and team list filters', () => {
    // Arrange
    const users = new URLSearchParams('search=ada&role=ADMIN&page=4');
    const teams = new URLSearchParams('search=dev');

    // Act
    const userFilters = readUserFilters(users);
    const teamFilters = readTeamFilters(teams);

    // Assert
    expect(userFilters).toEqual({ page: 4, limit: PAGE_SIZE, search: 'ada', role: 'ADMIN' });
    expect(teamFilters).toEqual({ page: 1, limit: PAGE_SIZE, search: 'dev' });
  });

  it('replaces a query param and resets page by default', () => {
    // Arrange
    const current = new URLSearchParams('status=TODO&page=3');

    // Act
    const next = replaceParam(current, 'status', 'DONE');
    const withoutReset = replaceParam(current, 'page', '2', false);
    const cleared = replaceParam(current, 'status', '');

    // Assert
    expect(next.get('status')).toBe('DONE');
    expect(next.get('page')).toBeNull();
    expect(withoutReset.get('page')).toBe('2');
    expect(cleared.get('status')).toBeNull();
  });
});
