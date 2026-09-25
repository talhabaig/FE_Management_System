import { ErrorState, LoadingState } from '../layout/AsyncState';
import { EmptyState } from '../ui/EmptyState';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { useCreateTask } from '../../hooks/useTasks';
import { useTeams } from '../../hooks/useTeams';
import { getErrorMessage } from '../../lib/api';
import { fromDatetimeLocal } from '../../lib/dates';
import { OPTION_PAGE_SIZE } from '../../lib/params';
import type { TaskFormValues } from '../../schemas/task';
import type { CreateTaskInput } from '../../types/api';
import { TaskForm } from './TaskForm';

function toCreateInput(values: TaskFormValues): CreateTaskInput {
  const deadline = fromDatetimeLocal(values.deadline);
  return {
    title: values.title.trim(),
    teamId: values.teamId,
    priority: values.priority,
    ...(values.description.trim() ? { description: values.description.trim() } : {}),
    ...(deadline ? { deadline } : {}),
    ...(values.assignedToId ? { assignedToId: values.assignedToId } : {}),
  };
}

export function CreateTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const teams = useTeams({ page: 1, limit: OPTION_PAGE_SIZE }, open);
  const createTask = useCreateTask();

  return (
    <Modal
      open={open}
      size="xl"
      title="New task"
      description="New tasks start as To do unless you change the status later."
      onClose={onClose}
    >
      {teams.isPending ? <LoadingState label="Loading teams" /> : null}
      {teams.isError ? <ErrorState error={teams.error} onRetry={() => void teams.refetch()} /> : null}
      {open && teams.data && teams.data.data.length === 0 ? (
        <EmptyState title="No teams available" description="You need a team you can manage before creating a task." />
      ) : null}
      {open && teams.data && teams.data.data.length > 0 ? (
        <TaskForm
          formId="create-task-modal"
          initialValues={{
            title: '',
            description: '',
            priority: 'MEDIUM',
            deadline: '',
            teamId: '',
            assignedToId: '',
          }}
          teams={teams.data.data}
          submitLabel="Create task"
          isSubmitting={createTask.isPending}
          formError={createTask.isError ? getErrorMessage(createTask.error) : undefined}
          onCancel={onClose}
          onSubmit={async (values) => {
            await createTask.mutateAsync(toCreateInput(values));
            toast.success('Task created.');
            onClose();
          }}
        />
      ) : null}
    </Modal>
  );
}
