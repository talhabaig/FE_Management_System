import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ROLE_OPTIONS } from '../../lib/labels';
import { userEditSchema, type UserEditFormValues } from '../../schemas/user';
import type { UpdateUserInput, User } from '../../types/api';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { Select } from '../ui/Select';
import { TextField } from '../ui/TextField';

export function UserEditForm({
  user,
  isSubmitting,
  formError,
  onSubmit,
}: {
  user: User;
  isSubmitting: boolean;
  formError?: string;
  onSubmit: (input: UpdateUserInput, deactivate: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    values: { name: user.name, role: user.role, isActive: user.isActive },
  });

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={handleSubmit((values) => {
        const input: UpdateUserInput = {};
        const name = values.name.trim();
        if (name !== user.name) {
          input.name = name;
        }
        if (values.role !== user.role) {
          input.role = values.role;
        }
        const deactivate = user.isActive && !values.isActive;
        if (!user.isActive && values.isActive) {
          input.isActive = true;
        }
        if (!deactivate && Object.keys(input).length === 0) {
          setError('name', { message: 'At least one field is required' });
          return;
        }
        onSubmit(input, deactivate);
      })}
    >
      {formError ? <Alert tone="error">{formError}</Alert> : null}
      <TextField label="Name" name="name" registration={register('name')} error={errors.name?.message} />
      <TextField label="Email" name="email" value={user.email} readOnly disabled />
      <Select label="Role" name="role" options={ROLE_OPTIONS} registration={register('role')} error={errors.role?.message} />
      <Checkbox label="Active account" name="isActive" registration={register('isActive')} error={errors.isActive?.message} />
      <p className="text-sm text-ink/65">
        Turning an active account off asks you to confirm. Deactivation is rejected when this person still manages a team.
      </p>
      <Button type="submit" isLoading={isSubmitting}>
        Save user
      </Button>
    </form>
  );
}
