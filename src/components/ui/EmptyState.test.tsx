import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title, description, and optional action', () => {
    // Arrange
    const title = 'No tasks';
    const description = 'Create one to get started.';

    // Act
    render(
      <EmptyState title={title} description={description} action={<button type="button">New task</button>} />,
    );

    // Assert
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New task' })).toBeInTheDocument();
  });
});
