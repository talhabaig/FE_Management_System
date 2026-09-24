import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useUpdateTaskStatus } from '../../hooks/useTasks';
import { getErrorMessage } from '../../lib/api';
import { TASK_STATUS_OPTIONS, taskStatusLabel } from '../../lib/labels';
import { statusSchema, type StatusFormValues } from '../../schemas/task';
import type { Task } from '../../types/api';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

export function TaskStatusForm({ task }: { task: Task }) {
  const updateStatus = useUpdateTaskStatus(task.id);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    values: { status: task.status },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit((values) => {
        if (values.status === task.status) {
          return;
        }
        updateStatus.mutate(values.status);
      })}
    >
      <Select
        label="Status"
        name="status"
        options={TASK_STATUS_OPTIONS}
        registration={register('status')}
        error={errors.status?.message}
        hint="Status changes are saved with the status endpoint."
      />
      {updateStatus.isError ? <Alert tone="error">{getErrorMessage(updateStatus.error)}</Alert> : null}
      {updateStatus.isSuccess && updateStatus.data ? (
        <Alert tone="success">Status updated to {taskStatusLabel(updateStatus.data.status)}.</Alert>
      ) : null}
      <Button type="submit" isLoading={updateStatus.isPending}>
        Update status
      </Button>
    </form>
  );
}
