import { describe, expect, it } from 'vitest';
import { commentSchema } from './comment';

describe('comment schema', () => {
  it('accepts a non-empty comment', () => {
    // Arrange
    const input = { content: 'Looks good to me.' };

    // Act
    const result = commentSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
  });

  it('rejects blank or whitespace-only comments', () => {
    // Arrange
    const input = { content: '   ' };

    // Act
    const result = commentSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(false);
  });
});
