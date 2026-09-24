import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../../hooks/useAuth';
import { getErrorMessage } from '../../lib/api';
import { applyFieldErrors } from '../../lib/formErrors';
import { paths } from '../../lib/paths';
import { registerSchema, type RegisterFormValues } from '../../schemas/auth';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';

export function RegisterForm() {
  const registerUser = useRegister();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={handleSubmit((values) => {
        registerUser.mutate(values, {
          onSuccess: () => navigate(paths.login, { state: { registered: true } }),
          onError: (error) => applyFieldErrors(error, setError),
        });
      })}
    >
      {registerUser.isError ? <Alert tone="error">{getErrorMessage(registerUser.error)}</Alert> : null}
      <TextField label="Name" name="name" autoComplete="name" registration={register('name')} error={errors.name?.message} />
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
        autoComplete="new-password"
        hint="8–72 characters, with at least one letter and one number."
        registration={register('password')}
        error={errors.password?.message}
      />
      <Button type="submit" fullWidth isLoading={registerUser.isPending}>
        Create account
      </Button>
      <p className="text-sm text-ink/70">
        Already registered?{' '}
        <Link to={paths.login} className="font-semibold text-clay">
          Sign in
        </Link>
      </p>
    </form>
  );
}
