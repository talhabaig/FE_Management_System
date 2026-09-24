import type { ReactNode } from 'react';
import { ErrorBoundary as Boundary } from 'react-error-boundary';
import { getErrorMessage } from '../../lib/api';
import { Button } from '../ui/Button';

export function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <Boundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-clay">Error</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Something went wrong</h1>
          <p className="mt-3 text-sm text-ink/70">{getErrorMessage(error)}</p>
          <div className="mt-6">
            <Button type="button" onClick={resetErrorBoundary}>
              Try again
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </Boundary>
  );
}
