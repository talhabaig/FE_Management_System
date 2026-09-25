import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('invokes the click handler', async () => {
    // Arrange
    const user = userEvent.setup();
    const onClick = vi.fn();

    // Act
    render(<Button onClick={onClick}>Save</Button>);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables the control while loading', () => {
    // Arrange
    const onClick = vi.fn();

    // Act
    render(
      <Button isLoading onClick={onClick}>
        Save
      </Button>,
    );

    // Assert
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    expect(onClick).not.toHaveBeenCalled();
  });
});
