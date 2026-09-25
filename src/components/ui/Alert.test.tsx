import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Alert } from './Alert';

describe('Alert', () => {
  it('exposes an error as an alert role', () => {
    // Arrange
    const message = 'Sign in failed.';

    // Act
    render(<Alert tone="error">{message}</Alert>);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(message);
  });

  it('exposes a success message as status', () => {
    // Arrange
    const message = 'Saved.';

    // Act
    render(<Alert tone="success">{message}</Alert>);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(message);
  });
});
