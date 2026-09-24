import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../components/layout/AsyncState';
import { PageHeader } from '../components/layout/PageHeader';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { useMe } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useSearchDraft } from '../hooks/useSearchDraft';
import { useTasks } from '../hooks/useTasks';
import { useTeams } from '../hooks/useTeams';
import { useUsers } from '../hooks/useUsers';
import { formatDateTime, isOverdue } from '../lib/dates';
import { priorityBadgeVariant, statusBadgeVariant, taskPriorityLabel, taskStatusLabel } from '../lib/labels';
import { readTaskFilters, replaceParam } from '../lib/listFilters';
import { OPTION_PAGE_SIZE } from '../lib/params';
import { paths } from '../lib/paths';
import { canCreateTask, canViewUsers } from '../lib/permissions';
import type { Task } from '../types/api';

function TaskCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl border border-sand bg-card p-4 text-left shadow-card transition hover:border-moss/35"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-ink">{task.title}</p>
        <Badge variant={statusBadgeVariant(task.status)}>{taskStatusLabel(task.status)}</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant={priorityBadgeVariant(task.priority)}>{taskPriorityLabel(task.priority)}</Badge>
        <span className="text-sm text-ink/65">{task.team.name}</span>
      </div>
      <p className="mt-2 text-sm text-ink/70">
        {task.assignedTo?.name ?? 'Unassigned'}
        {task.deadline ? ` · ${formatDateTime(task.deadline)}` : ''}
        {isOverdue(task.deadline, task.status) ? ' · Overdue' : ''}
      </p>
    </button>
  );
}

export function TasksPage() {
  useDocumentTitle('Tasks');
  const navigate = useNavigate();
  const me = useMe();
  const [params, setParams] = useSearchParams();
  const state = useMemo(() => readTaskFilters(params), [params]);
  const search = useSearchDraft(params.get('search') ?? '', setParams);
  const tasks = useTasks(state.filters, !state.dateError);
  const teams = useTeams({ page: 1, limit: OPTION_PAGE_SIZE });
  const showAssignee = canViewUsers(me.data?.role);
  const users = useUsers({ page: 1, limit: OPTION_PAGE_SIZE }, showAssignee);
  const allowCreate = canCreateTask(me.data?.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description={
          me.data?.role === 'USER' ? 'Tasks assigned to you.' : 'Tasks you are allowed to view, with filters and sorting.'
        }
        action={
          allowCreate ? (
            <Button type="button" onClick={() => navigate(paths.newTask)}>
              New task
            </Button>
          ) : null
        }
      />
      <TaskFilters
        values={{ ...state.values, search: search.draft }}
        teams={teams.data?.data ?? []}
        assignees={users.data?.data ?? []}
        showAssignee={showAssignee}
        dateError={state.dateError}
        onSearchChange={search.setDraft}
        onChange={(name, value) => setParams((current) => replaceParam(current, name, value))}
        onClear={() => {
          search.setDraft('');
          setParams(new URLSearchParams());
        }}
      />
      {tasks.isPending ? <LoadingState label="Loading tasks" /> : null}
      {tasks.isError ? <ErrorState error={tasks.error} onRetry={() => void tasks.refetch()} /> : null}
      {tasks.data && tasks.data.data.length === 0 ? (
        <EmptyState
          title="No tasks"
          description={
            me.data?.role === 'USER'
              ? 'No tasks are assigned to you.'
              : 'No tasks match these filters. Create one or clear the filters.'
          }
          action={
            allowCreate ? (
              <Button type="button" onClick={() => navigate(paths.newTask)}>
                New task
              </Button>
            ) : undefined
          }
        />
      ) : null}
      {tasks.data && tasks.data.data.length > 0 ? (
        <>
          <div className="space-y-3 md:hidden">
            {tasks.data.data.map((task) => (
              <TaskCard key={task.id} task={task} onOpen={() => navigate(paths.task(task.id))} />
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-2xl border border-sand bg-card shadow-card md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-sand/70 text-ink/70">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Team</th>
                  <th className="px-4 py-3 font-semibold">Assignee</th>
                  <th className="px-4 py-3 font-semibold">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                {tasks.data.data.map((task) => (
                  <tr key={task.id}>
                    <td className="px-4 py-3">
                      <Button type="button" variant="ghost" onClick={() => navigate(paths.task(task.id))}>
                        {task.title}
                      </Button>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeVariant(task.status)}>{taskStatusLabel(task.status)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={priorityBadgeVariant(task.priority)}>{taskPriorityLabel(task.priority)}</Badge>
                    </td>
                    <td className="px-4 py-3">{task.team.name}</td>
                    <td className="px-4 py-3">{task.assignedTo?.name ?? 'Unassigned'}</td>
                    <td className="px-4 py-3">
                      {formatDateTime(task.deadline)}
                      {isOverdue(task.deadline, task.status) ? ' · Overdue' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
      {tasks.data && tasks.data.pagination.totalPages > 1 ? (
        <Pagination
          page={tasks.data.pagination.page}
          totalPages={tasks.data.pagination.totalPages}
          hasNextPage={tasks.data.pagination.hasNextPage}
          hasPreviousPage={tasks.data.pagination.hasPreviousPage}
          onPageChange={(page) => setParams((current) => replaceParam(current, 'page', String(page), false))}
        />
      ) : null}
    </div>
  );
}
