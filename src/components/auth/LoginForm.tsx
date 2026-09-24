import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/useAuth';
import { getErrorMessage, isApiRequestError, isLoginLockedError } from '../../lib/api';
import { applyFieldErrors } from '../../lib/formErrors';
import { paths, readRedirect } from '../../lib/paths';
import { loginSchema, type LoginFormValues } from '../../schemas/auth';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';

const LOGIN_LOCK_STORAGE_KEY = 'taskMgmt.loginLock';
const DEFAULT_LOCK_SECONDS = 15 * 60;

type StoredLoginLock = {
  email: string;
  untilMs: number;
  message: string;
};

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function readStoredLock(): StoredLoginLock | null {
  try {
    const raw = sessionStorage.getItem(LOGIN_LOCK_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as StoredLoginLock;
    if (
      typeof parsed.email !== 'string' ||
      typeof parsed.untilMs !== 'number' ||
      typeof parsed.message !== 'string'
    ) {
      return null;
    }
    if (parsed.untilMs <= Date.now()) {
      sessionStorage.removeItem(LOGIN_LOCK_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredLock(lock: StoredLoginLock): void {
  sessionStorage.setItem(LOGIN_LOCK_STORAGE_KEY, JSON.stringify(lock));
}

function clearStoredLock(): void {
  sessionStorage.removeItem(LOGIN_LOCK_STORAGE_KEY);
}

export function LoginForm({ registered }: { registered: boolean }) {
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const [lockMessage, setLockMessage] = useState<string | null>(null);
  const [lockUntilMs, setLockUntilMs] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const emailValue = watch('email');

  useEffect(() => {
    const stored = readStoredLock();
    const currentEmail = emailValue.trim().toLowerCase();

    if (!stored) {
      return;
    }

    if (currentEmail && stored.email !== currentEmail) {
      setLockMessage(null);
      setLockUntilMs(null);
      setRemainingSeconds(0);
      return;
    }

    setLockMessage(stored.message);
    setLockUntilMs(stored.untilMs);
  }, [emailValue]);

  useEffect(() => {
    if (lockUntilMs == null) {
      setRemainingSeconds(0);
      return;
    }

    const tick = () => {
      const left = Math.max(0, Math.ceil((lockUntilMs - Date.now()) / 1000));
      setRemainingSeconds(left);
      if (left <= 0) {
        setLockUntilMs(null);
        setLockMessage(null);
        clearStoredLock();
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [lockUntilMs]);

  const locked = lockUntilMs != null && remainingSeconds > 0;

  const applyLock = (message: string, retryAfterSeconds?: number) => {
    const seconds = retryAfterSeconds != null && retryAfterSeconds > 0 ? retryAfterSeconds : DEFAULT_LOCK_SECONDS;
    const untilMs = Date.now() + seconds * 1000;
    const email = emailValue.trim().toLowerCase();
    setLockMessage(message);
    setLockUntilMs(untilMs);
    if (email) {
      writeStoredLock({ email, untilMs, message });
    }
  };

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={handleSubmit((values) => {
        if (locked) {
          return;
        }
        login.mutate(values, {
          onSuccess: () => {
            clearStoredLock();
            setLockUntilMs(null);
            setLockMessage(null);
            navigate(readRedirect(location.state), { replace: true });
          },
          onError: (error) => {
            applyFieldErrors(error, setError);
            if (isLoginLockedError(error)) {
              applyLock(error.message, error.retryAfterSeconds);
              return;
            }
            if (isApiRequestError(error) && error.status === 401) {
              // Wrong password / unknown email — keep submit enabled.
              return;
            }
          },
        });
      })}
    >
      {registered ? <Alert tone="success">Account created. Sign in to continue.</Alert> : null}
      {lockMessage ? <Alert tone="error">{lockMessage}</Alert> : null}
      {!lockMessage && login.isError && !isLoginLockedError(login.error) ? (
        <Alert tone="error">{getErrorMessage(login.error)}</Alert>
      ) : null}
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
      <Button type="submit" fullWidth disabled={locked} isLoading={login.isPending}>
        {locked ? `Try again in ${formatCountdown(remainingSeconds)}` : 'Sign in'}
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
