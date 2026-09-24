import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { OPTION_PAGE_SIZE } from '../../lib/params';
import { useTeamMembers } from '../../hooks/useTeams';
import { getErrorMessage } from '../../lib/api';
import { applyFieldErrors } from '../../lib/formErrors';
import { taskFormSchema, type TaskFormValues } from '../../schemas/task';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { TextField } from '../ui/TextField';

interface TaskFormProps {
  formId: string;
  initialValues: TaskFormValues;
  teams: { id: string; name: string }[];
  submitLabel: string;
  isSubmitting: boolean;
  formError?: string;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancel: () => void;
}

export function TaskForm({
  formId,
  initialValues,
  teams,
  submitLabel,
  isSubmitting,
  formError,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [discardOpen, setDiscardOpen] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    setError,
    formState: { errors, isDirty },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: initialValues,
  });
  const teamId = watch('teamId');
  const members = useTeamMembers(teamId, { page: 1, limit: OPTION_PAGE_SIZE }, Boolean(teamId));
  const memberOptions = (members.data?.data ?? []).map((member) => ({
    value: member.userId,
    label: `${member.user.name} (${member.user.email})`,
  }));

  useEffect(() => {
    if (!members.data) {
      return;
    }
    const ids = new Set(members.data.data.map((member) => member.userId));
    const current = getValues('assignedToId');
    if (current && !ids.has(current)) {
      setValue('assignedToId', '');
    }
  }, [members.data, getValues, setValue]);

  return (
    <>
      <form
        id={formId}
        className="space-y-4"
        noValidate
        onSubmit={handleSubmit(async (values) => {
          try {
            await onSubmit(values);
          } catch (error) {
            applyFieldErrors(error, setError);
          }
        })}
      >
        {formError ? <Alert tone="error">{formError}</Alert> : null}
        <TextField label="Title" name="title" registration={register('title')} error={errors.title?.message} />
        <TextArea
          label="Description"
          name="description"
          registration={register('description')}
          error={errors.description?.message}
          hint="Optional. Up to 5000 characters."
        />
        <Select
          label="Priority"
          name="priority"
          options={[
            { value: 'LOW', label: 'Low' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'HIGH', label: 'High' },
          ]}
          registration={register('priority')}
          error={errors.priority?.message}
        />
        <TextField
          label="Deadline"
          name="deadline"
          type="datetime-local"
          registration={register('deadline')}
          error={errors.deadline?.message}
          hint="Optional."
        />
        <Select
          label="Team"
          name="teamId"
          placeholder="Select a team"
          options={teams.map((team) => ({ value: team.id, label: team.name }))}
          registration={register('teamId')}
          error={errors.teamId?.message}
        />
        <Select
          label="Assignee"
          name="assignedToId"
          placeholder="Unassigned"
          options={memberOptions}
          registration={register('assignedToId')}
          error={errors.assignedToId?.message}
          hint={
            members.data?.pagination.hasNextPage
              ? 'Showing the first 100 members. The assignee must already belong to the team.'
              : 'Optional. The assignee must be an active member of the team.'
          }
        />
        {members.isError ? <Alert tone="error">{getErrorMessage(members.error)}</Alert> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" isLoading={isSubmitting}>
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (isDirty) {
                setDiscardOpen(true);
                return;
              }
              onCancel();
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
      <Modal
        open={discardOpen}
        title="Discard unsaved changes?"
        description="Your edits will be lost."
        onClose={() => setDiscardOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setDiscardOpen(false)}>
              Keep editing
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                setDiscardOpen(false);
                onCancel();
              }}
            >
              Discard
            </Button>
          </>
        }
      />
    </>
  );
}
