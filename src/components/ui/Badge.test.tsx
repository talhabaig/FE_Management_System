import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders the provided label', () => {
    // Arrange
    const label = 'Admin';

    // Act
    render(<Badge variant="danger">{label}</Badge>);

    // Assert
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
