import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('hides itself when the list is empty', () => {
    // Arrange
    const pagination = {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    // Act
    const { container } = render(<Pagination pagination={pagination} onPageChange={vi.fn()} />);

    // Assert
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the current range and calls onPageChange for the next page', async () => {
    // Arrange
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const pagination = {
      page: 2,
      limit: 20,
      total: 45,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    };

    // Act
    render(<Pagination pagination={pagination} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Next' }));

    // Assert
    expect(screen.getByText('Showing 21–40 of 45')).toBeInTheDocument();
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('does not change page when Previous is disabled', () => {
    // Arrange
    const onPageChange = vi.fn();
    const pagination = {
      page: 1,
      limit: 20,
      total: 4,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    // Act
    render(<Pagination pagination={pagination} onPageChange={onPageChange} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
