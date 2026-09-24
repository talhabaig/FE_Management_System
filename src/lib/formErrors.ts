import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';
import { isApiRequestError } from './api';

export function applyFieldErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): void {
  if (!isApiRequestError(error) || !error.details) {
    return;
  }
  for (const detail of error.details) {
    if (!detail.path) {
      continue;
    }
    setError(detail.path as FieldPath<T>, { message: detail.message });
  }
}
