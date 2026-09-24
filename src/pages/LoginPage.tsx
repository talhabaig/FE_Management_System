import { useLocation } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { readRegistered } from '../lib/paths';

export function LoginPage() {
  useDocumentTitle('Sign in');
  const location = useLocation();

  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-sand bg-card p-8 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Task Management</p>
        <h1 className="mt-2 font-display text-4xl text-ink">Sign in</h1>
        <p className="mt-2 text-sm text-ink/70">Use the account an administrator created, or register as a new user.</p>
        <div className="mt-6">
          <LoginForm registered={readRegistered(location.state)} />
        </div>
      </div>
    </div>
  );
}
