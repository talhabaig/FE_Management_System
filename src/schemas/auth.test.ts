import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './auth';

describe('auth schemas', () => {
  it('accepts a valid registration payload', () => {
    // Arrange
    const input = { name: 'Ada Lovelace', email: 'Ada@Example.com', password: 'Password123' };

    // Act
    const result = registerSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('ada@example.com');
      expect(result.data.name).toBe('Ada Lovelace');
    }
  });

  it('rejects a weak registration password', () => {
    // Arrange
    const input = { name: 'Ada', email: 'ada@example.com', password: 'short' };

    // Act
    const result = registerSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
  });

  it('requires a valid email and password on login', () => {
    // Arrange
    const valid = { email: 'ada@example.com', password: 'secret' };
    const missingPassword = { email: 'ada@example.com', password: '' };

    // Act
    const ok = loginSchema.safeParse(valid);
    const fail = loginSchema.safeParse(missingPassword);

    // Assert
    expect(ok.success).toBe(true);
    expect(fail.success).toBe(false);
  });
});
