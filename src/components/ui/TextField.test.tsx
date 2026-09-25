import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TextField } from './TextField';

describe('TextField', () => {
  it('shows an error message when validation fails', () => {
    // Arrange
    const error = 'Email is required';

    // Act
    render(<TextField label="Email" name="email" error={error} />);

    // Assert
    expect(screen.getByText(error)).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('toggles a password field between hidden and visible', async () => {
    // Arrange
    const user = userEvent.setup();

    // Act
    render(<TextField label="Password" name="password" type="password" />);
    const input = screen.getByLabelText('Password');
    const toggle = screen.getByRole('button', { name: 'Show password' });
    await user.click(toggle);

    // Assert
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
  });
});
