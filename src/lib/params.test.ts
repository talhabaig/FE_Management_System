import { describe, expect, it } from 'vitest';
import {
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

describe('params', () => {
  it('reads a positive integer or falls back', () => {
    // Arrange
    const valid = '3';
    const invalid = '0';
    const missing = null;

    // Act
    const page = readPositiveInt(valid, 1);
    const zero = readPositiveInt(invalid, 1);
    const fallback = readPositiveInt(missing, 7);

    // Assert
    expect(page).toBe(3);
    expect(zero).toBe(1);
    expect(fallback).toBe(7);
  });

  it('recognizes known enum query values', () => {
    // Arrange / Act / Assert
    expect(isTaskStatus('TODO')).toBe(true);
    expect(isTaskStatus('OPEN')).toBe(false);
    expect(isTaskPriority('HIGH')).toBe(true);
    expect(isRole('ADMIN')).toBe(true);
    expect(isSortField('deadline')).toBe(true);
    expect(isSortOrder('asc')).toBe(true);
    expect(isSortOrder('up')).toBe(false);
  });

  it('trims optional strings and drops blanks', () => {
    // Arrange
    const padded = '  alpha  ';
    const blank = '   ';

    // Act
    const search = readOptional(padded);
    const empty = readOptional(blank);

    // Assert
    expect(search).toBe('alpha');
    expect(empty).toBeUndefined();
  });

  it('builds start and end of day ISO values in order', () => {
    // Arrange
    const date = '2026-09-25';

    // Act
    const start = startOfDayIso(date);
    const end = endOfDayIso(date);

    // Assert
    expect(new Date(start).getTime()).toBeLessThan(new Date(end).getTime());
    expect(start).toMatch(/T/);
    expect(end).toMatch(/T/);
  });

  it('flags an inverted date range', () => {
    // Arrange
    const from = '2026-09-26';
    const to = '2026-09-25';

    // Act
    const invalid = isDateRangeInvalid(from, to);
    const valid = isDateRangeInvalid(to, from);
    const partial = isDateRangeInvalid(from, undefined);

    // Assert
    expect(invalid).toBe(true);
    expect(valid).toBe(false);
    expect(partial).toBe(false);
  });
});
