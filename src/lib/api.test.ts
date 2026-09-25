import { describe, expect, it } from 'vitest';
import {
  ApiRequestError,
  compactParams,
  getAccessToken,
  isApiRequestError,
  isLoginLockedError,
  setAccessToken,
} from './api';

describe('api helpers', () => {
  it('stores and clears the in-memory access token', () => {
    // Arrange
    setAccessToken(null);

    // Act
    setAccessToken('token-1');
    const stored = getAccessToken();
    setAccessToken(null);
    const cleared = getAccessToken();

    // Assert
    expect(stored).toBe('token-1');
    expect(cleared).toBeNull();
  });

  it('recognizes API and login-lock errors', () => {
    // Arrange
    const locked = new ApiRequestError(429, 'LOGIN_LOCKED', 'Try later');
    const unauthorized = new ApiRequestError(401, 'UNAUTHORIZED', 'No');
    const plain = new Error('nope');

    // Act / Assert
    expect(isApiRequestError(locked)).toBe(true);
    expect(isApiRequestError(plain)).toBe(false);
    expect(isLoginLockedError(locked)).toBe(true);
    expect(isLoginLockedError(unauthorized)).toBe(false);
  });

  it('drops empty values and sorts compact query params', () => {
    // Arrange
    const params = {
      search: '  auth  ',
      page: 2,
      unused: '',
      skip: undefined,
      limit: 20,
    };

    // Act
    const compact = compactParams(params);

    // Assert
    expect(compact).toEqual({ limit: 20, page: 2, search: 'auth' });
    expect(Object.keys(compact)).toEqual(['limit', 'page', 'search']);
  });
});
