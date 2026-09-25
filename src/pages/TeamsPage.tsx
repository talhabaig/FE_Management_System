import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../components/layout/AsyncState';
import { PageHeader } from '../components/layout/PageHeader';
import { CreateTeamModal } from '../components/teams/CreateTeamModal';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { TextField } from '../components/ui/TextField';
import { useMe } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useSearchDraft } from '../hooks/useSearchDraft';
import { useTeams } from '../hooks/useTeams';
import { formatDateTime } from '../lib/dates';
import { readTeamFilters, replaceParam } from '../lib/listFilters';
import { paths, readCreate } from '../lib/paths';
import { canCreateTeam } from '../lib/permissions';
import type { Team } from '../types/api';

function TeamCard({ team, onOpen }: { team: Team; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl border border-sand bg-card p-4 text-left shadow-card transition hover:border-moss/35"
    >
      <p className="font-semibold text-ink">{team.name}</p>
      <p className="mt-2 text-sm text-ink/70">Manager: {team.manager.name}</p>
      <p className="mt-1 text-sm text-ink/55">Created {formatDateTime(team.createdAt)}</p>
    </button>
  );
}

export function TeamsPage() {
  useDocumentTitle('Teams');
  const navigate = useNavigate();
  const location = useLocation();
  const me = useMe();
  const [createOpen, setCreateOpen] = useState(false);
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readTeamFilters(params), [params]);
  const search = useSearchDraft(params.get('search') ?? '', setParams);
  const teams = useTeams(filters);
  const allowCreate = canCreateTeam(me.data?.role);

  useEffect(() => {
    if (!allowCreate || !readCreate(location.state)) {
      return;
    }
    setCreateOpen(true);
    navigate(`${location.pathname}${location.search}`, { replace: true, state: {} });
  }, [allowCreate, location.pathname, location.search, location.state, navigate]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams"
        description={
          me.data?.role === 'USER'
            ? 'Teams you belong to. Membership is read-only.'
            : 'Teams you can view. Managers can update only the teams they manage.'
        }
        action={
          allowCreate ? (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              New team
            </Button>
          ) : null
        }
      />
      <div className="max-w-md">
        <TextField
          label="Search"
          name="search"
          value={search.draft}
          maxLength={100}
          placeholder="Team name"
          onChange={(event) => search.setDraft(event.target.value)}
        />
      </div>
      {teams.isPending ? <LoadingState label="Loading teams" /> : null}
      {teams.isError ? <ErrorState error={teams.error} onRetry={() => void teams.refetch()} /> : null}
      {teams.data && teams.data.data.length === 0 ? (
        <EmptyState
          title="No teams"
          description="No teams match this search."
          action={
            allowCreate ? (
              <Button type="button" onClick={() => setCreateOpen(true)}>
                New team
              </Button>
            ) : undefined
          }
        />
      ) : null}
      {teams.data && teams.data.data.length > 0 ? (
        <>
          <div className="space-y-3 md:hidden">
            {teams.data.data.map((team) => (
              <TeamCard key={team.id} team={team} onOpen={() => navigate(paths.team(team.id))} />
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-2xl border border-sand bg-card shadow-card md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-sand/70 text-ink/70">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Manager</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                {teams.data.data.map((team) => (
                  <tr key={team.id}>
                    <td className="px-4 py-3">
                      <Button type="button" variant="ghost" onClick={() => navigate(paths.team(team.id))}>
                        {team.name}
                      </Button>
                    </td>
                    <td className="px-4 py-3">{team.manager.name}</td>
                    <td className="px-4 py-3">{formatDateTime(team.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
      {teams.data ? (
        <Pagination
          pagination={teams.data.pagination}
          onPageChange={(page) => setParams((current) => replaceParam(current, 'page', String(page), false))}
        />
      ) : null}
      {allowCreate ? <CreateTeamModal open={createOpen} onClose={() => setCreateOpen(false)} /> : null}
    </div>
  );
}
