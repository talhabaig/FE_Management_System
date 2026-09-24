import { getErrorMessage } from '../../lib/api';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-16">
      <Spinner label={label} hideLabel={false} />
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="space-y-3">
      <Alert tone="error">{getErrorMessage(error)}</Alert>
      {onRetry ? (
        <Button type="button" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
