import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { paths } from '../lib/paths';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-lg py-16">
      <h1 className="font-display text-4xl">Page not found</h1>
      <p className="mt-3 text-sm text-ink/70">That address is not part of this application.</p>
      <div className="mt-6">
        <Button type="button" onClick={() => navigate(paths.dashboard)}>
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}
