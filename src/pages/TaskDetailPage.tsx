import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CommentForm } from '../components/comments/CommentForm';
import { CommentList } from '../components/comments/CommentList';
import { ErrorState, LoadingState } from '../components/layout/AsyncState';
import { PageHeader } from '../components/layout/PageHeader';
import { AssignTaskForm } from '../components/tasks/AssignTaskForm';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskStatusForm } from '../components/tasks/TaskStatusForm';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useMe } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useDeleteTask, useTask, useUpdateTask } from '../hooks/useTasks';
import { useTeams } from '../hooks/useTeams';
import { getErrorMessage } from '../lib/api';
import { formatDateTime, fromDatetimeLocal, isOverdue, toDatetimeLocal } from '../lib/dates';
import { priorityBadgeVariant, statusBadgeVariant, taskPriorityLabel, taskStatusLabel } from '../lib/labels';
import { OPTION_PAGE_SIZE } from '../lib/params';
import { paths, readNotice } from '../lib/paths';
import { canManageTask, canUpdateTaskStatus } from '../lib/permissions';
import type { TaskFormValues } from '../schemas/task';
import type { Task, UpdateTaskInput } from '../types/api';

function toUpdateInput(values: TaskFormValues, task: Task): UpdateTaskInput {
  const input: UpdateTaskInput = {};
  const title = values.title.trim();
  if (title !== task.title) {
    input.title = title;
  }
  const description = values.description.trim();
  if (description !== (task.description ?? '')) {
    input.description = description.length > 0 ? description : null;
  }
  if (values.priority !== task.priority) {
    input.priority = values.priority;
  }
  const nextDeadline = fromDatetimeLocal(values.deadline) ?? null;
  const currentDeadline = task.deadline ? new Date(task.deadline).toISOString() : null;
  const sameDeadline =
    nextDeadline === currentDeadline ||
    (nextDeadline !== null && currentDeadline !== null && new Date(nextDeadline).getTime() === new Date(currentDeadline).getTime());
  if (!sameDeadline) {
    input.deadline = nextDeadline;
  }
  if (values.teamId !== task.teamId) {
    input.teamId = values.teamId;
  }
  const assignee = values.assignedToId || null;
  if (assignee !== task.assignedToId) {
    input.assignedToId = assignee;
  }
  return input;
}

export function TaskDetailPage() {
  const params = useParams();
  const taskId = params.taskId ?? '';
  const task = useTask(taskId);
  useDocumentTitle(task.data?.title ?? 'Task');
  const navigate = useNavigate();
  const location = useLocation();
  const me = useMe();
  const teams = useTeams({ page: 1, limit: OPTION_PAGE_SIZE });
  const updateTask = useUpdateTask(taskId);
  const deleteTask = useDeleteTask();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const notice = readNotice(location.state);
  const actor = me.data;
  const current = task.data;
  const manageable = actor && current ? canManageTask(actor, current) : false;
  const statusAllowed = actor && current ? canUpdateTaskStatus(actor, current) : false;

  if (task.isPending) {
    return <LoadingState label="Loading task" />;
  }
  if (task.isError || !current || !actor) {
    return <ErrorState error={task.error ?? new Error('Task not found')} onRetry={() => void task.refetch()} />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={current.title}
        description={current.description ?? 'No description.'}
        action={
          manageable ? (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                deleteTask.reset();
                setDeleteOpen(true);
              }}
            >
              Delete task
            </Button>
          ) : null
        }
      />
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      <dl className="grid gap-4 rounded-2xl border border-sand bg-card p-5 shadow-card sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold text-ink/60">Status</dt>
          <dd className="mt-1">
            <Badge variant={statusBadgeVariant(current.status)}>{taskStatusLabel(current.status)}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink/60">Priority</dt>
          <dd className="mt-1">
            <Badge variant={priorityBadgeVariant(current.priority)}>{taskPriorityLabel(current.priority)}</Badge>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink/60">Team</dt>
          <dd className="mt-1 text-sm">{current.team.name}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink/60">Assignee</dt>
          <dd className="mt-1 text-sm">{current.assignedTo?.name ?? 'Unassigned'}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink/60">Deadline</dt>
          <dd className="mt-1 text-sm">
            {formatDateTime(current.deadline)}
            {isOverdue(current.deadline, current.status) ? ' · Overdue' : ''}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink/60">Created by</dt>
          <dd className="mt-1 text-sm">
            {current.createdBy.name} · {formatDateTime(current.createdAt)}
          </dd>
        </div>
      </dl>

      {!manageable ? (
        <p className="text-sm text-ink/70">You can update the status. The title and other details are read-only.</p>
      ) : null}

      {statusAllowed ? (
        <section className="max-w-xl rounded-2xl border border-sand bg-card p-5 shadow-card">
          <h2 className="font-display text-2xl">Update status</h2>
          <div className="mt-4">
            <TaskStatusForm task={current} />
          </div>
        </section>
      ) : null}

      {manageable ? (
        <section className="max-w-xl rounded-2xl border border-sand bg-card p-5 shadow-card">
          <h2 className="font-display text-2xl">Assign</h2>
          <div className="mt-4">
            <AssignTaskForm taskId={current.id} teamId={current.teamId} assignedToId={current.assignedToId} />
          </div>
        </section>
      ) : null}

      {manageable ? (
        <section className="max-w-2xl rounded-2xl border border-sand bg-card p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl">Edit task</h2>
            <Button type="button" variant="secondary" onClick={() => setEditing((open) => !open)}>
              {editing ? 'Hide editor' : 'Edit details'}
            </Button>
          </div>
          {formMessage ? (
            <div className="mt-4">
              <Alert tone="error">{formMessage}</Alert>
            </div>
          ) : null}
          {updateTask.isSuccess ? (
            <div className="mt-4">
              <Alert tone="success">Task saved.</Alert>
            </div>
          ) : null}
          {editing ? (
            <div className="mt-4">
              <TaskForm
                key={current.updatedAt}
                formId="edit-task"
                initialValues={{
                  title: current.title,
                  description: current.description ?? '',
                  priority: current.priority,
                  deadline: toDatetimeLocal(current.deadline),
                  teamId: current.teamId,
                  assignedToId: current.assignedToId ?? '',
                }}
                teams={teams.data?.data ?? [current.team]}
                submitLabel="Save task"
                isSubmitting={updateTask.isPending}
                formError={updateTask.isError ? getErrorMessage(updateTask.error) : undefined}
                onCancel={() => setEditing(false)}
                onSubmit={async (values) => {
                  const input = toUpdateInput(values, current);
                  if (Object.keys(input).length === 0) {
                    setFormMessage('At least one field is required');
                    return;
                  }
                  setFormMessage(null);
                  await updateTask.mutateAsync(input);
                  setEditing(false);
                }}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Comments</h2>
        <CommentList taskId={current.id} />
        <div className="max-w-2xl rounded-2xl border border-sand bg-card p-5 shadow-card">
          <CommentForm taskId={current.id} />
        </div>
      </section>

      <Modal
        open={deleteOpen}
        title="Delete this task?"
        description={`“${current.title}” and its comments will be removed.`}
        onClose={() => setDeleteOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={deleteTask.isPending}
              onClick={() => {
                deleteTask.mutate(current.id, {
                  onSuccess: () => navigate(paths.tasks),
                });
              }}
            >
              Delete task
            </Button>
          </>
        }
      >
        {deleteTask.isError ? <Alert tone="error">{getErrorMessage(deleteTask.error)}</Alert> : null}
      </Modal>
    </div>
  );
}
