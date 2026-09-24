import { useNavigate } from 'react-router-dom';
import { ErrorState, LoadingState } from '../components/layout/AsyncState';
import { PageHeader } from '../components/layout/PageHeader';
import { TaskForm } from '../components/tasks/TaskForm';
import { EmptyState } from '../components/ui/EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useCreateTask } from '../hooks/useTasks';
import { useTeams } from '../hooks/useTeams';
import { getErrorMessage } from '../lib/api';
import { fromDatetimeLocal } from '../lib/dates';
import { OPTION_PAGE_SIZE } from '../lib/params';
import { paths } from '../lib/paths';
import type { TaskFormValues } from '../schemas/task';
import type { CreateTaskInput } from '../types/api';

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

export function TaskCreatePage() {
  useDocumentTitle('New task');
  const navigate = useNavigate();
  const teams = useTeams({ page: 1, limit: OPTION_PAGE_SIZE });
  const createTask = useCreateTask();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="New task" description="New tasks start as To do unless you change the status later." />
      {teams.isPending ? <LoadingState label="Loading teams" /> : null}
      {teams.isError ? <ErrorState error={teams.error} onRetry={() => void teams.refetch()} /> : null}
      {teams.data && teams.data.data.length === 0 ? (
        <EmptyState title="No teams available" description="You need a team you can manage before creating a task." />
      ) : null}
      {teams.data && teams.data.data.length > 0 ? (
        <TaskForm
          formId="create-task"
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
          onCancel={() => navigate(paths.tasks)}
          onSubmit={async (values) => {
            const task = await createTask.mutateAsync(toCreateInput(values));
            navigate(paths.task(task.id), { state: { notice: 'Task created.' } });
          }}
        />
      ) : null}
    </div>
  );
}
