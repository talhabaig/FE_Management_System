import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { useCreateTeam } from '../../hooks/useTeams';
import { getErrorMessage } from '../../lib/api';
import { TeamForm } from './TeamForm';

export function CreateTeamModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const createTeam = useCreateTeam();

  return (
    <Modal
      open={open}
      size="xl"
      title="New team"
      description="Choose an active administrator or manager. They join the team automatically."
      onClose={onClose}
    >
      {open ? (
        <TeamForm
          mode="create"
          canAssignManager
          isSubmitting={createTeam.isPending}
          formError={createTeam.isError ? getErrorMessage(createTeam.error) : undefined}
          onCancel={onClose}
          onCreate={(values) => {
            createTeam.mutate(values, {
              onSuccess: () => {
                toast.success('Team created.');
                onClose();
              },
            });
          }}
        />
      ) : null}
    </Modal>
  );
}
