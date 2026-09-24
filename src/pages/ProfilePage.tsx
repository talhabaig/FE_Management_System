import { ErrorState, LoadingState } from '../components/layout/AsyncState';
import { PageHeader } from '../components/layout/PageHeader';
import { useToast } from '../components/ui/Toast';
import { ProfileForm } from '../components/users/ProfileForm';
import { useMe } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useUpdateUser } from '../hooks/useUsers';
import { getErrorMessage } from '../lib/api';

export function ProfilePage() {
  useDocumentTitle('Profile');
  const me = useMe();
  const toast = useToast();
  const updateUser = useUpdateUser(me.data?.id ?? '');

  if (me.isPending || !me.data) {
    return <LoadingState label="Loading profile" />;
  }
  if (me.isError) {
    return <ErrorState error={me.error} onRetry={() => void me.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="You can change your name. Email and role stay as the server stores them." />
      <ProfileForm
        user={me.data}
        isSubmitting={updateUser.isPending}
        formError={updateUser.isError ? getErrorMessage(updateUser.error) : undefined}
        saved={updateUser.isSuccess}
        onSubmit={(name) =>
          updateUser.mutate(
            { name },
            {
              onSuccess: () => toast.success('Name saved.'),
              onError: (error) => toast.error(getErrorMessage(error)),
            },
          )
        }
      />
    </div>
  );
}
