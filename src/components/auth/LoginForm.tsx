import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useLogin } from '../../hooks/useAuth';
import { getErrorMessage } from '../../lib/api';
import { applyFieldErrors } from '../../lib/formErrors';
import { paths, readRedirect } from '../../lib/paths';
import { loginSchema, type LoginFormValues } from '../../schemas/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';

export function LoginForm({ registered }: { registered: boolean }) {
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={handleSubmit((values) => {
        login.mutate(values, {
          onSuccess: () => navigate(readRedirect(location.state), { replace: true }),
          onError: (error) => applyFieldErrors(error, setError),
        });
      })}
    >
      {registered ? <Alert tone="success">Account created. Sign in to continue.</Alert> : null}
      {login.isError ? <Alert tone="error">{getErrorMessage(login.error)}</Alert> : null}
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        registration={register('email')}
        error={errors.email?.message}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        registration={register('password')}
        error={errors.password?.message}
      />
      <Button type="submit" fullWidth isLoading={login.isPending}>
        Sign in
      </Button>
      <p className="text-sm text-ink/70">
        Need an account?{' '}
        <Link to={paths.register} className="font-semibold text-clay">
          Create one
        </Link>
      </p>
    </form>
  );
}
