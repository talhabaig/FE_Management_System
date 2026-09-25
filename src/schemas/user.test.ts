import { describe, expect, it } from 'vitest';
import { profileSchema, userEditSchema } from './user';

describe('user schemas', () => {
  it('accepts a trimmed profile name', () => {
    // Arrange
    const input = { name: '  Ada  ' };

    // Act
    const result = profileSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Ada');
    }
  });

  it('rejects a name that is too short', () => {
    // Arrange
    const input = { name: 'A' };

    // Act
    const result = profileSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
  });

  it('accepts a user edit payload', () => {
    // Arrange
    const input = { name: 'Ada Lovelace', role: 'MANAGER', isActive: true };

    // Act
    const result = userEditSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
  });
});
