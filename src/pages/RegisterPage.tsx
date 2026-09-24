import { RegisterForm } from '../components/auth/RegisterForm';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function RegisterPage() {
  useDocumentTitle('Create account');

  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-sand bg-card p-8 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Task Management</p>
        <h1 className="mt-2 font-display text-4xl text-ink">Create account</h1>
        <p className="mt-2 text-sm text-ink/70">New accounts are created with the User role. Sign in after registering.</p>
        <div className="mt-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
