import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../components/layout/AsyncState';
import { PageHeader } from '../components/layout/PageHeader';
import { UserEditForm } from '../components/users/UserEditForm';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useMe } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useDeactivateUser, useUpdateUser, useUser } from '../hooks/useUsers';
import { getErrorMessage } from '../lib/api';
import { paths } from '../lib/paths';
import type { UpdateUserInput } from '../types/api';

export function UserEditPage() {
  const params = useParams();
  const userId = params.userId ?? '';
  const me = useMe();
  const userQuery = useUser(userId);
  const updateUser = useUpdateUser(userId);
  const deactivate = useDeactivateUser();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  useDocumentTitle(userQuery.data ? `Edit ${userQuery.data.name}` : 'Edit user');

  if (me.data && me.data.id === userId) {
    return <Navigate to={paths.profile} replace />;
  }

  if (userQuery.isPending) {
    return <LoadingState label="Loading user" />;
  }
  if (userQuery.isError || !userQuery.data) {
    return <ErrorState error={userQuery.error ?? new Error('User not found')} onRetry={() => void userQuery.refetch()} />;
  }

  const user = userQuery.data;

  const save = (input: UpdateUserInput, shouldDeactivate: boolean) => {
    if (shouldDeactivate) {
      if (Object.keys(input).length > 0) {
        updateUser.mutate(input, {
          onSuccess: () => {
            deactivate.reset();
            setConfirmOpen(true);
          },
        });
        return;
      }
      deactivate.reset();
      setConfirmOpen(true);
      return;
    }
    updateUser.mutate(input);
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader title={user.name} description="Update the name or role. Deactivation uses a separate confirmation." />
      {updateUser.isSuccess ? <Alert tone="success">User saved.</Alert> : null}
      <UserEditForm
        user={user}
        isSubmitting={updateUser.isPending}
        formError={updateUser.isError ? getErrorMessage(updateUser.error) : undefined}
        onSubmit={save}
      />
      {user.isActive ? (
        <Button
          type="button"
          variant="danger"
          onClick={() => {
            deactivate.reset();
            setConfirmOpen(true);
          }}
        >
          Deactivate
        </Button>
      ) : null}
      <Modal
        open={confirmOpen}
        title="Deactivate this user?"
        description="They will not be able to sign in. This is refused while they still manage a team."
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={deactivate.isPending}
              onClick={() => {
                deactivate.mutate(user.id, {
                  onSuccess: () => navigate(paths.users),
                });
              }}
            >
              Deactivate
            </Button>
          </>
        }
      >
        {deactivate.isError ? <Alert tone="error">{getErrorMessage(deactivate.error)}</Alert> : null}
      </Modal>
    </div>
  );
}
