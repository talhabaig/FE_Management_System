import { describe, expect, it, vi } from 'vitest';
import { ApiRequestError } from './api';
import { applyFieldErrors } from './formErrors';

describe('applyFieldErrors', () => {
  it('maps API field details onto the form', () => {
    // Arrange
    const setError = vi.fn();
    const error = new ApiRequestError(400, 'VALIDATION', 'Invalid', [
      { path: 'email', message: 'Already used' },
      { path: 'password', message: 'Too short' },
    ]);

    // Act
    applyFieldErrors(error, setError);

    // Assert
    expect(setError).toHaveBeenCalledTimes(2);
    expect(setError).toHaveBeenCalledWith('email', { message: 'Already used' });
    expect(setError).toHaveBeenCalledWith('password', { message: 'Too short' });
  });

  it('ignores non-API errors and details without a path', () => {
    // Arrange
    const setError = vi.fn();
    const plain = new Error('boom');
    const api = new ApiRequestError(400, 'VALIDATION', 'Invalid', [{ path: '', message: 'skip me' }]);

    // Act
    applyFieldErrors(plain, setError);
    applyFieldErrors(api, setError);

    // Assert
    expect(setError).not.toHaveBeenCalled();
  });
});
