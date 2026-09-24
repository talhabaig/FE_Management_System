import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { TeamForm } from '../components/teams/TeamForm';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useCreateTeam } from '../hooks/useTeams';
import { getErrorMessage } from '../lib/api';
import { paths } from '../lib/paths';

export function TeamCreatePage() {
  useDocumentTitle('New team');
  const navigate = useNavigate();
  const createTeam = useCreateTeam();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="New team" description="Choose an active administrator or manager. They join the team automatically." />
      <TeamForm
        mode="create"
        canAssignManager
        isSubmitting={createTeam.isPending}
        formError={createTeam.isError ? getErrorMessage(createTeam.error) : undefined}
        onCancel={() => navigate(paths.teams)}
        onCreate={(values) => {
          createTeam.mutate(values, {
            onSuccess: (team) => navigate(paths.team(team.id), { state: { notice: 'Team created.' } }),
          });
        }}
      />
    </div>
  );
}
