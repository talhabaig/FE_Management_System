import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardFilters } from '../components/dashboard/DashboardFilters';
import { SummaryGrid } from '../components/dashboard/SummaryGrid';
import { ErrorState, LoadingState } from '../components/layout/AsyncState';
import { PageHeader } from '../components/layout/PageHeader';
import { useMe } from '../hooks/useAuth';
import { useDashboardSummary } from '../hooks/useDashboard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useTeams } from '../hooks/useTeams';
import { useUsers } from '../hooks/useUsers';
import { readDashboardFilters, replaceParam } from '../lib/listFilters';
import { OPTION_PAGE_SIZE } from '../lib/params';
import { canViewUsers } from '../lib/permissions';

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const me = useMe();
  const [params, setParams] = useSearchParams();
  const state = useMemo(() => readDashboardFilters(params), [params]);
  const summary = useDashboardSummary(state.filters, !state.dateError);
  const teams = useTeams({ page: 1, limit: OPTION_PAGE_SIZE });
  const showAssignee = canViewUsers(me.data?.role);
  const users = useUsers({ page: 1, limit: OPTION_PAGE_SIZE }, showAssignee);

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
      {state.dateError ? null : summary.data ? <SummaryGrid summary={summary.data} /> : null}
    </div>
  );
}
