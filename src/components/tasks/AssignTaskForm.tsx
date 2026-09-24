import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAssignTask } from '../../hooks/useTasks';
import { useTeamMembers } from '../../hooks/useTeams';
import { getErrorMessage } from '../../lib/api';
import { OPTION_PAGE_SIZE } from '../../lib/params';
import { assignSchema, type AssignFormValues } from '../../schemas/task';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

export function AssignTaskForm({
  taskId,
  teamId,
  assignedToId,
}: {
  taskId: string;
  teamId: string;
  assignedToId: string | null;
}) {
  const members = useTeamMembers(teamId, { page: 1, limit: OPTION_PAGE_SIZE });
  const assign = useAssignTask(taskId);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignFormValues>({
    resolver: zodResolver(assignSchema),
    values: { assignedToId: assignedToId ?? '' },
  });

  const options = (members.data?.data ?? []).map((member) => ({
    value: member.userId,
    label: `${member.user.name} (${member.user.email})`,
  }));

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit((values) => {
        if (values.assignedToId === assignedToId) {
          return;
        }
        assign.mutate(values.assignedToId);
      })}
    >
      {members.isPending ? <p className="text-sm text-ink/70">Loading team members…</p> : null}
      {members.isError ? <Alert tone="error">{getErrorMessage(members.error)}</Alert> : null}
      <Select
        label="Assign to"
        name="assignedToId"
        placeholder="Select a member"
        options={options}
        registration={register('assignedToId')}
        error={errors.assignedToId?.message}
        hint="Assignment uses the assign endpoint and notifies the member."
      />
      {assign.isError ? <Alert tone="error">{getErrorMessage(assign.error)}</Alert> : null}
      {assign.isSuccess ? <Alert tone="success">Task assigned.</Alert> : null}
      <Button type="submit" isLoading={assign.isPending} disabled={options.length === 0}>
        Assign task
      </Button>
    </form>
  );
}
