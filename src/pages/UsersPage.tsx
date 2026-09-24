import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../components/layout/AsyncState';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { Select } from '../components/ui/Select';
import { TextField } from '../components/ui/TextField';
import { useMe } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useSearchDraft } from '../hooks/useSearchDraft';
import { useUsers } from '../hooks/useUsers';
import { roleBadgeVariant, ROLE_OPTIONS, roleLabel } from '../lib/labels';
import { readUserFilters, replaceParam } from '../lib/listFilters';
import { paths } from '../lib/paths';
import { canEditUsers } from '../lib/permissions';

export function UsersPage() {
  useDocumentTitle('Users');
  const navigate = useNavigate();
  const me = useMe();
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readUserFilters(params), [params]);
  const search = useSearchDraft(params.get('search') ?? '', setParams);
  const users = useUsers(filters);
  const allowEdit = canEditUsers(me.data?.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description={allowEdit ? 'Search people, change roles, and deactivate accounts.' : 'Search the directory. Editing is limited to administrators.'}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Search"
          name="search"
          value={search.draft}
          maxLength={100}
          placeholder="Name or email"
          onChange={(event) => search.setDraft(event.target.value)}
        />
        <Select
          label="Role"
          name="role"
          value={params.get('role') ?? ''}
          placeholder="All roles"
          options={ROLE_OPTIONS}
          onChange={(event) => setParams((current) => replaceParam(current, 'role', event.target.value))}
        />
      </div>
      {users.isPending ? <LoadingState label="Loading users" /> : null}
      {users.isError ? <ErrorState error={users.error} onRetry={() => void users.refetch()} /> : null}
      {users.data && users.data.data.length === 0 ? (
        <EmptyState title="No users" description="No accounts match this search." />
      ) : null}
      {users.data && users.data.data.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-sand bg-card shadow-card">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-sand/70 text-ink/70">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Account</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {users.data.data.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-semibold">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={roleBadgeVariant(user.role)}>{roleLabel(user.role)}</Badge>
                  </td>
                  <td className="px-4 py-3">{user.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-3">
                    {allowEdit && me.data?.id !== user.id ? (
                      <Button type="button" variant="secondary" onClick={() => navigate(paths.user(user.id))}>
                        Edit
                      </Button>
                    ) : (
                      <span className="text-ink/50">{me.data?.id === user.id ? 'This is you' : 'View only'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {users.data && users.data.pagination.totalPages > 1 ? (
        <Pagination
          page={users.data.pagination.page}
          totalPages={users.data.pagination.totalPages}
          hasNextPage={users.data.pagination.hasNextPage}
          hasPreviousPage={users.data.pagination.hasPreviousPage}
          onPageChange={(page) => setParams((current) => replaceParam(current, 'page', String(page), false))}
        />
      ) : null}
    </div>
  );
}
