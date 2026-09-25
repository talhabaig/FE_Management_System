import { describe, expect, it } from 'vitest';
import { addMemberSchema, createTeamSchema, updateTeamSchema } from './team';

const managerId = '11111111-1111-4111-8111-111111111111';

describe('team schemas', () => {
  it('accepts a valid create-team payload', () => {
    // Arrange
    const input = { name: 'Development', description: 'Core team', managerId };

    // Act
    const result = createTeamSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
  });

  it('allows an empty manager id when updating a team', () => {
    // Arrange
    const input = { name: 'Development', description: '', managerId: '' };

    // Act
    const result = updateTeamSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
  });

  it('requires a user id when adding a member', () => {
    // Arrange
    const valid = { userId: managerId };
    const invalid = { userId: 'user-1' };

    // Act
    const ok = addMemberSchema.safeParse(valid);
    const fail = addMemberSchema.safeParse(invalid);

    // Assert
    expect(ok.success).toBe(true);
    expect(fail.success).toBe(false);
  });
});
