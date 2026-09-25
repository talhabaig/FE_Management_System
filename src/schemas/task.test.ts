import { describe, expect, it } from 'vitest';
import { assignSchema, statusSchema, taskFormSchema } from './task';

const teamId = '11111111-1111-4111-8111-111111111111';
const memberId = '22222222-2222-4222-8222-222222222222';

describe('task schemas', () => {
  it('accepts a valid task form', () => {
    // Arrange
    const input = {
      title: 'Write tests',
      description: 'Cover the core helpers',
      priority: 'HIGH',
      deadline: '2026-09-30T10:00',
      teamId,
      assignedToId: memberId,
    };

    // Act
    const result = taskFormSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
  });

  it('rejects a task without a title or team', () => {
    // Arrange
    const input = {
      title: '  ',
      description: '',
      priority: 'LOW',
      deadline: '',
      teamId: 'not-a-uuid',
      assignedToId: '',
    };

    // Act
    const result = taskFormSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
  });

  it('accepts status and assignment payloads', () => {
    // Arrange
    const status = { status: 'IN_PROGRESS' };
    const assign = { assignedToId: memberId };

    // Act
    const statusResult = statusSchema.safeParse(status);
    const assignResult = assignSchema.safeParse(assign);
    const badAssign = assignSchema.safeParse({ assignedToId: '' });

    // Assert
    expect(statusResult.success).toBe(true);
    expect(assignResult.success).toBe(true);
    expect(badAssign.success).toBe(false);
  });
});
