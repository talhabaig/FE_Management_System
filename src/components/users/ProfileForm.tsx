import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { roleBadgeVariant, roleLabel } from '../../lib/labels';
import { profileSchema, type ProfileFormValues } from '../../schemas/user';
import type { User } from '../../types/api';
import { Alert } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';

export function ProfileForm({
  user,
  isSubmitting,
  formError,
  saved,
  onSubmit,
}: {
  user: User;
  isSubmitting: boolean;
  formError?: string;
  saved: boolean;
  onSubmit: (name: string) => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: { name: user.name },
  });

  return (
    <form
      className="max-w-xl space-y-4"
      noValidate
      onSubmit={handleSubmit((values) => {
        const name = values.name.trim();
        if (name === user.name) {
          setError('name', { message: 'At least one field is required' });
          return;
        }
        onSubmit(name);
      })}
    >
      {formError ? <Alert tone="error">{formError}</Alert> : null}
      {saved ? <Alert tone="success">Name saved.</Alert> : null}
      <TextField label="Name" name="name" registration={register('name')} error={errors.name?.message} />
      <div>
        <p className="text-sm font-semibold text-ink">Email</p>
        <p className="mt-1 text-sm text-ink/80">{user.email}</p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-ink">Role</p>
        <Badge variant={roleBadgeVariant(user.role)}>{roleLabel(user.role)}</Badge>
      </div>
      <p className="text-sm text-ink/65">
        {user.role === 'ADMIN'
          ? 'Email cannot be changed. Administrators cannot change their own role.'
          : 'Email and role are visible here and can only be changed by an administrator.'}
      </p>
      <Button type="submit" isLoading={isSubmitting}>
        Save profile
      </Button>
    </form>
  );
}
