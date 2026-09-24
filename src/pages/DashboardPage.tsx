import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DashboardFilters } from '../components/dashboard/DashboardFilters';
import { SummaryGrid } from '../components/dashboard/SummaryGrid';
import { ErrorState, LoadingState } from '../components/layout/AsyncState';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { useMe } from '../hooks/useAuth';
import { useDashboardSummary } from '../hooks/useDashboard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useTeams } from '../hooks/useTeams';
import { useUsers } from '../hooks/useUsers';
import { readDashboardFilters, replaceParam } from '../lib/listFilters';
import { OPTION_PAGE_SIZE } from '../lib/params';
import { paths } from '../lib/paths';
import { canCreateTask, canCreateTeam, canViewUsers } from '../lib/permissions';

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const me = useMe();
  const [params, setParams] = useSearchParams();
  const state = useMemo(() => readDashboardFilters(params), [params]);
  const summary = useDashboardSummary(state.filters, !state.dateError);
  const teams = useTeams({ page: 1, limit: OPTION_PAGE_SIZE });
  const showAssignee = canViewUsers(me.data?.role);
  const users = useUsers({ page: 1, limit: OPTION_PAGE_SIZE }, showAssignee);
  const allowCreateTask = canCreateTask(me.data?.role);
  const allowCreateTeam = canCreateTeam(me.data?.role);
  const isEmpty = summary.data?.total === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          me.data?.role === 'ADMIN'
            ? 'System counts for every task you are allowed to see.'
            : me.data?.role === 'MANAGER'
              ? 'Counts for tasks on your teams and tasks assigned to you.'
              : 'Counts for tasks assigned to you.'
        }
      />
      <DashboardFilters
        values={state.values}
        teams={teams.data?.data ?? []}
        assignees={users.data?.data ?? []}
        showAssignee={showAssignee}
        dateError={state.dateError}
        onChange={(name, value) => setParams((current) => replaceParam(current, name, value))}
        onClear={() => setParams(new URLSearchParams())}
      />
      {teams.isError ? <ErrorState error={teams.error} onRetry={() => void teams.refetch()} /> : null}
      {state.dateError ? null : summary.isPending ? <LoadingState label="Loading dashboard" /> : null}
      {state.dateError ? null : summary.isError ? (
        <ErrorState error={summary.error} onRetry={() => void summary.refetch()} />
      ) : null}
      {state.dateError ? null : summary.data ? (
        <>
          <SummaryGrid summary={summary.data} filterValues={state.values} />
          {isEmpty ? (
            <EmptyState
              title="No tasks yet"
              description={
                allowCreateTeam
                  ? 'Create a team, then add your first task to populate these counts.'
                  : allowCreateTask
                    ? 'Create a task on one of your teams to populate these counts.'
                    : 'When a manager assigns you a task, it will show up here.'
              }
              action={
                allowCreateTeam ? (
                  <Link
                    to={paths.newTeam}
                    className="inline-flex rounded-lg bg-clay px-4 py-2 text-sm font-semibold text-white hover:bg-[#9a4522]"
                  >
                    New team
                  </Link>
                ) : allowCreateTask ? (
                  <Link
                    to={paths.newTask}
                    className="inline-flex rounded-lg bg-clay px-4 py-2 text-sm font-semibold text-white hover:bg-[#9a4522]"
                  >
                    New task
                  </Link>
                ) : undefined
              }
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
