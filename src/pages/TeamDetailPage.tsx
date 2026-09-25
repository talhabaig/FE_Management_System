import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../components/layout/AsyncState';
import { PageHeader } from '../components/layout/PageHeader';
import { AddMemberForm, TeamForm } from '../components/teams/TeamForm';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { useMe } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAddMember, useDeleteTeam, useRemoveMember, useTeam, useTeamMembers, useUpdateTeam } from '../hooks/useTeams';
import { getErrorMessage } from '../lib/api';
import { formatDateTime } from '../lib/dates';
import { PAGE_SIZE } from '../lib/params';
import { paths, readNotice } from '../lib/paths';
import { canDeleteTeam, canManageTeam } from '../lib/permissions';
import type { TeamMember } from '../types/api';

export function TeamDetailPage() {
  const params = useParams();
  const teamId = params.teamId ?? '';
  const teamQuery = useTeam(teamId);
  useDocumentTitle(teamQuery.data?.name ?? 'Team');
  const location = useLocation();
  const navigate = useNavigate();
  const me = useMe();
  const [memberPage, setMemberPage] = useState(1);
  const members = useTeamMembers(teamId, { page: memberPage, limit: PAGE_SIZE });
  const updateTeam = useUpdateTeam(teamId);
  const deleteTeam = useDeleteTeam();
  const addMember = useAddMember(teamId);
  const removeMember = useRemoveMember(teamId);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const notice = readNotice(location.state);
  const team = teamQuery.data;
  const actor = me.data;
  const manageable = actor && team ? canManageTeam(actor, team) : false;
  const deletable = canDeleteTeam(actor?.role);

  if (teamQuery.isPending) {
    return <LoadingState label="Loading team" />;
  }
  if (teamQuery.isError || !team || !actor) {
    return <ErrorState error={teamQuery.error ?? new Error('Team not found')} onRetry={() => void teamQuery.refetch()} />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={team.name}
        description={team.description ?? 'No description.'}
        action={
          deletable ? (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                deleteTeam.reset();
                setDeleteOpen(true);
              }}
            >
              Delete team
            </Button>
          ) : null
        }
      />
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      <dl className="grid gap-4 rounded-2xl border border-sand bg-card p-5 shadow-card sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold text-ink/60">Manager</dt>
          <dd className="mt-1 text-sm">
            {team.manager.name} ({team.manager.email})
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink/60">Created</dt>
          <dd className="mt-1 text-sm">{formatDateTime(team.createdAt)}</dd>
        </div>
      </dl>

      {manageable ? (
        <section className="max-w-2xl rounded-2xl border border-sand bg-card p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl">Edit team</h2>
            <Button type="button" variant="secondary" onClick={() => setEditing((open) => !open)}>
              {editing ? 'Hide editor' : 'Edit details'}
            </Button>
          </div>
          {updateTeam.isSuccess ? (
            <div className="mt-4">
              <Alert tone="success">Team saved.</Alert>
            </div>
          ) : null}
          {editing ? (
            <div className="mt-4">
              <TeamForm
                key={team.updatedAt}
                mode="edit"
                team={team}
                canAssignManager={actor.role === 'ADMIN'}
                isSubmitting={updateTeam.isPending}
                formError={updateTeam.isError ? getErrorMessage(updateTeam.error) : undefined}
                onCancel={() => setEditing(false)}
                onUpdate={(input) => {
                  updateTeam.mutate(input, { onSuccess: () => setEditing(false) });
                }}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Members</h2>
        {members.isPending ? <LoadingState label="Loading members" /> : null}
        {members.isError ? <ErrorState error={members.error} onRetry={() => void members.refetch()} /> : null}
        {members.data && members.data.data.length === 0 ? (
          <EmptyState title="No members" description="This team has no members yet." />
        ) : null}
        {members.data && members.data.data.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-sand bg-card shadow-card">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-sand/70 text-ink/70">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                {members.data.data.map((member) => {
                  const isManager = member.userId === team.managerId;
                  return (
                    <tr key={member.id}>
                      <td className="px-4 py-3">
                        {member.user.name}
                        {isManager ? ' · Manager' : ''}
                      </td>
                      <td className="px-4 py-3">{member.user.email}</td>
                      <td className="px-4 py-3">{formatDateTime(member.createdAt)}</td>
                      <td className="px-4 py-3">
                        {manageable && !isManager ? (
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => {
                              removeMember.reset();
                              setMemberToRemove(member);
                            }}
                          >
                            Remove
                          </Button>
                        ) : (
                          <span className="text-ink/50">{isManager ? 'Manager stays until reassigned' : 'Read only'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
        {members.data ? (
          <Pagination pagination={members.data.pagination} onPageChange={setMemberPage} />
        ) : null}
        {manageable ? (
          <div className="max-w-xl rounded-2xl border border-sand bg-card p-5 shadow-card">
            <h3 className="font-display text-xl">Add member</h3>
            <div className="mt-4">
              <AddMemberForm
                memberIds={(members.data?.data ?? []).map((member) => member.userId)}
                isSubmitting={addMember.isPending}
                formError={addMember.isError ? getErrorMessage(addMember.error) : undefined}
                onSubmit={async (userId) => {
                  await addMember.mutateAsync(userId);
                }}
              />
            </div>
            {addMember.isSuccess ? (
              <div className="mt-3">
                <Alert tone="success">Member added.</Alert>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <Modal
        open={deleteOpen}
        title="Delete this team?"
        description="Deletion is refused while the team still has tasks."
        onClose={() => setDeleteOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={deleteTeam.isPending}
              onClick={() => {
                deleteTeam.mutate(team.id, { onSuccess: () => navigate(paths.teams) });
              }}
            >
              Delete team
            </Button>
          </>
        }
      >
        {deleteTeam.isError ? <Alert tone="error">{getErrorMessage(deleteTeam.error)}</Alert> : null}
      </Modal>
      <Modal
        open={Boolean(memberToRemove)}
        title="Remove this member?"
        description={
          memberToRemove
            ? `${memberToRemove.user.name} will lose access to this team. The current manager cannot be removed.`
            : undefined
        }
        onClose={() => setMemberToRemove(null)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setMemberToRemove(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={removeMember.isPending}
              onClick={() => {
                if (!memberToRemove) {
                  return;
                }
                removeMember.mutate(memberToRemove.userId, { onSuccess: () => setMemberToRemove(null) });
              }}
            >
              Remove member
            </Button>
          </>
        }
      >
        {removeMember.isError ? <Alert tone="error">{getErrorMessage(removeMember.error)}</Alert> : null}
      </Modal>
    </div>
  );
}
