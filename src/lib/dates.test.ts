import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatDateTime, fromDatetimeLocal, isOverdue, toDatetimeLocal } from './dates';

describe('dates', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns None for an empty datetime', () => {
    // Arrange
    const empty = null;

    // Act
    const result = formatDateTime(empty);

    // Assert
    expect(result).toBe('None');
  });

  it('returns Invalid date for a non-date string', () => {
    // Arrange
    const value = 'not-a-date';

    // Act
    const result = formatDateTime(value);

    // Assert
    expect(result).toBe('Invalid date');
  });

  it('formats a valid ISO timestamp', () => {
    // Arrange
    const value = '2026-09-22T23:00:00.000Z';

    // Act
    const result = formatDateTime(value);

    // Assert
    expect(result).not.toBe('None');
    expect(result).not.toBe('Invalid date');
    expect(result.length).toBeGreaterThan(0);
  });

  it('converts a valid ISO value to datetime-local and back to ISO', () => {
    // Arrange
    const iso = '2026-03-15T14:30:00.000Z';

    // Act
    const local = toDatetimeLocal(iso);
    const restored = fromDatetimeLocal(local);

    // Assert
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(restored).toBeDefined();
    expect(new Date(restored ?? '').getTime()).toBe(new Date(local).getTime());
  });

  it('treats a past deadline as overdue unless the task is done', () => {
    // Arrange
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-25T12:00:00.000Z'));
    const past = '2026-09-24T12:00:00.000Z';

    // Act
    const overdueTodo = isOverdue(past, 'TODO');
    const doneIsNotOverdue = isOverdue(past, 'DONE');
    const missingDeadline = isOverdue(null, 'TODO');

    // Assert
    expect(overdueTodo).toBe(true);
    expect(doneIsNotOverdue).toBe(false);
    expect(missingDeadline).toBe(false);
  });
});
