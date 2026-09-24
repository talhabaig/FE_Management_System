import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUsers } from '../../hooks/useUsers';
import { getErrorMessage } from '../../lib/api';
import { OPTION_PAGE_SIZE } from '../../lib/params';
import { useDebouncedValue } from '../../hooks/useSearchDraft';
import {
  addMemberSchema,
  createTeamSchema,
  updateTeamSchema,
  type AddMemberFormValues,
  type CreateTeamFormValues,
  type UpdateTeamFormValues,
} from '../../schemas/team';
import type { Team, UpdateTeamInput } from '../../types/api';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { TextField } from '../ui/TextField';

interface TeamFormProps {
  mode: 'create' | 'edit';
  team?: Team;
  canAssignManager: boolean;
  isSubmitting: boolean;
  formError?: string;
  onCreate?: (values: { name: string; description?: string; managerId: string }) => void;
  onUpdate?: (values: UpdateTeamInput) => void;
  onCancel: () => void;
}

export function TeamForm({ mode, team, canAssignManager, isSubmitting, formError, onCreate, onUpdate, onCancel }: TeamFormProps) {
  const [discardOpen, setDiscardOpen] = useState(false);
  const managers = useUsers({ page: 1, limit: OPTION_PAGE_SIZE, role: 'MANAGER' }, canAssignManager);
  const admins = useUsers({ page: 1, limit: OPTION_PAGE_SIZE, role: 'ADMIN' }, canAssignManager);
  const managerOptions = [...(admins.data?.data ?? []), ...(managers.data?.data ?? [])]
    .filter((user) => user.isActive)
    .map((user) => ({ value: user.id, label: `${user.name} (${user.email}) · ${user.role}` }));

  if (mode === 'create') {
    return (
      <CreateTeamFields
        managerOptions={managerOptions}
        managersError={managers.isError ? managers.error : admins.isError ? admins.error : null}
        isSubmitting={isSubmitting}
        formError={formError}
        discardOpen={discardOpen}
        setDiscardOpen={setDiscardOpen}
        onCreate={onCreate}
        onCancel={onCancel}
      />
    );
  }

  return (
    <EditTeamFields
      team={team}
      canAssignManager={canAssignManager}
      managerOptions={managerOptions}
      managersError={managers.isError ? managers.error : admins.isError ? admins.error : null}
      isSubmitting={isSubmitting}
      formError={formError}
      discardOpen={discardOpen}
      setDiscardOpen={setDiscardOpen}
      onUpdate={onUpdate}
      onCancel={onCancel}
    />
  );
}

function CreateTeamFields({
  managerOptions,
  managersError,
  isSubmitting,
  formError,
  discardOpen,
  setDiscardOpen,
  onCreate,
  onCancel,
}: {
  managerOptions: { value: string; label: string }[];
  managersError: unknown;
  isSubmitting: boolean;
  formError?: string;
  discardOpen: boolean;
  setDiscardOpen: (open: boolean) => void;
  onCreate?: (values: { name: string; description?: string; managerId: string }) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { name: '', description: '', managerId: '' },
  });

  return (
    <>
      <form
        className="space-y-4"
        noValidate
        onSubmit={handleSubmit((values) => {
          onCreate?.({
            name: values.name.trim(),
            managerId: values.managerId,
            ...(values.description.trim() ? { description: values.description.trim() } : {}),
          });
        })}
      >
        {formError ? <Alert tone="error">{formError}</Alert> : null}
        {managersError ? <Alert tone="error">{getErrorMessage(managersError)}</Alert> : null}
        <TextField label="Name" name="name" registration={register('name')} error={errors.name?.message} />
        <TextArea
          label="Description"
          name="description"
          registration={register('description')}
          error={errors.description?.message}
          hint="Optional. Up to 1000 characters."
        />
        <Select
          label="Manager"
          name="managerId"
          placeholder="Select a manager"
          options={managerOptions}
          registration={register('managerId')}
          error={errors.managerId?.message}
          hint="The manager must be an active administrator or manager. They are added as a member."
        />
        <FormActions
          submitLabel="Create team"
          isSubmitting={isSubmitting}
          onCancel={() => {
            if (isDirty) {
              setDiscardOpen(true);
              return;
            }
            onCancel();
          }}
        />
      </form>
      <DiscardModal open={discardOpen} onClose={() => setDiscardOpen(false)} onDiscard={onCancel} />
    </>
  );
}

function EditTeamFields({
  team,
  canAssignManager,
  managerOptions,
  managersError,
  isSubmitting,
  formError,
  discardOpen,
  setDiscardOpen,
  onUpdate,
  onCancel,
}: {
  team?: Team;
  canAssignManager: boolean;
  managerOptions: { value: string; label: string }[];
  managersError: unknown;
  isSubmitting: boolean;
  formError?: string;
  discardOpen: boolean;
  setDiscardOpen: (open: boolean) => void;
  onUpdate?: (values: UpdateTeamInput) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<UpdateTeamFormValues>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: {
      name: team?.name ?? '',
      description: team?.description ?? '',
      managerId: team?.managerId ?? '',
    },
  });

  return (
    <>
      <form
        className="space-y-4"
        noValidate
        onSubmit={handleSubmit((values) => {
          if (!team) {
            return;
          }
          const payload: UpdateTeamInput = {};
          const name = values.name.trim();
          const description = values.description.trim();
          if (name !== team.name) {
            payload.name = name;
          }
          if (description !== (team.description ?? '')) {
            payload.description = description.length > 0 ? description : null;
          }
          if (canAssignManager && values.managerId && values.managerId !== team.managerId) {
            payload.managerId = values.managerId;
          }
          if (Object.keys(payload).length === 0) {
            setError('name', { message: 'At least one field is required' });
            return;
          }
          onUpdate?.(payload);
        })}
      >
        {formError ? <Alert tone="error">{formError}</Alert> : null}
        {canAssignManager && managersError ? <Alert tone="error">{getErrorMessage(managersError)}</Alert> : null}
        <TextField label="Name" name="name" registration={register('name')} error={errors.name?.message} />
        <TextArea
          label="Description"
          name="description"
          registration={register('description')}
          error={errors.description?.message}
        />
        {canAssignManager ? (
          <Select
            label="Manager"
            name="managerId"
            options={managerOptions}
            registration={register('managerId')}
            error={errors.managerId?.message}
            hint="Only an administrator can change the manager."
          />
        ) : (
          <p className="text-sm text-ink/70">Manager: {team?.manager.name ?? 'Unknown'}. Only an administrator can change it.</p>
        )}
        <FormActions
          submitLabel="Save team"
          isSubmitting={isSubmitting}
          onCancel={() => {
            if (isDirty) {
              setDiscardOpen(true);
              return;
            }
            onCancel();
          }}
        />
      </form>
      <DiscardModal open={discardOpen} onClose={() => setDiscardOpen(false)} onDiscard={onCancel} />
    </>
  );
}

function FormActions({
  submitLabel,
  isSubmitting,
  onCancel,
}: {
  submitLabel: string;
  isSubmitting: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="submit" isLoading={isSubmitting}>
        {submitLabel}
      </Button>
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

function DiscardModal({ open, onClose, onDiscard }: { open: boolean; onClose: () => void; onDiscard: () => void }) {
  return (
    <Modal
      open={open}
      title="Discard unsaved changes?"
      description="Your edits will be lost."
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Keep editing
          </Button>
          <Button type="button" variant="danger" onClick={onDiscard}>
            Discard
          </Button>
        </>
      }
    />
  );
}

export function AddMemberForm({
  memberIds,
  isSubmitting,
  formError,
  onSubmit,
}: {
  memberIds: string[];
  isSubmitting: boolean;
  formError?: string;
  onSubmit: (userId: string) => Promise<void>;
}) {
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 300);
  const users = useUsers({
    page: 1,
    limit: OPTION_PAGE_SIZE,
    ...(debounced.trim() ? { search: debounced.trim() } : {}),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { userId: '' },
  });

  const options = (users.data?.data ?? [])
    .filter((user) => user.isActive && !memberIds.includes(user.id))
    .map((user) => ({ value: user.id, label: `${user.name} (${user.email})` }));

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values.userId);
        reset({ userId: '' });
      })}
    >
      {formError ? <Alert tone="error">{formError}</Alert> : null}
      {users.isError ? <Alert tone="error">{getErrorMessage(users.error)}</Alert> : null}
      <TextField
        label="Find a user"
        name="memberSearch"
        value={search}
        maxLength={100}
        placeholder="Name or email"
        onChange={(event) => setSearch(event.target.value)}
      />
      <Select
        label="User"
        name="userId"
        placeholder="Select a user"
        options={options}
        registration={register('userId')}
        error={errors.userId?.message}
        hint={users.data?.pagination.hasNextPage ? 'Showing the first 100 matches. Search to narrow the list.' : undefined}
      />
      <Button type="submit" isLoading={isSubmitting} disabled={options.length === 0}>
        Add member
      </Button>
    </form>
  );
}
