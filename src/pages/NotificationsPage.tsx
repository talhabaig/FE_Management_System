import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../components/layout/AsyncState';
import { PageHeader } from '../components/layout/PageHeader';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { useToast } from '../components/ui/Toast';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../hooks/useNotifications';
import { formatDateTime } from '../lib/dates';
import { getErrorMessage } from '../lib/api';
import { notificationTypeLabel } from '../lib/labels';
import { readPositiveInt, PAGE_SIZE } from '../lib/params';
import { replaceParam } from '../lib/listFilters';
import { paths } from '../lib/paths';

export function NotificationsPage() {
  useDocumentTitle('Notifications');
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const filters = useMemo(
    () => ({ page: readPositiveInt(params.get('page'), 1), limit: PAGE_SIZE }),
    [params],
  );
  const notifications = useNotifications(filters);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const [pendingId, setPendingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Assignments and status changes for your account."
        action={
          <Button
            type="button"
            variant="secondary"
            isLoading={markAll.isPending}
            onClick={() =>
              markAll.mutate(undefined, {
                onSuccess: (result) => toast.success(`Marked ${result.updated} as read.`),
                onError: (error) => toast.error(getErrorMessage(error)),
              })
            }
          >
            Mark all read
          </Button>
        }
      />
      {markRead.isError ? <Alert tone="error">{getErrorMessage(markRead.error)}</Alert> : null}
      {notifications.isPending ? <LoadingState label="Loading notifications" /> : null}
      {notifications.isError ? (
        <ErrorState error={notifications.error} onRetry={() => void notifications.refetch()} />
      ) : null}
      {notifications.data && notifications.data.data.length === 0 ? (
        <EmptyState title="No notifications" description="When a task is assigned to you, it will appear here." />
      ) : null}
      {notifications.data && notifications.data.data.length > 0 ? (
        <ul className="space-y-3">
          {notifications.data.data.map((notification) => (
            <li key={notification.id} className="rounded-2xl border border-sand bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={notification.isRead ? 'neutral' : 'info'}>
                  {notification.isRead ? 'Read' : 'Unread'}
                </Badge>
                <Badge variant="neutral">{notificationTypeLabel(notification.type)}</Badge>
                <span className="text-xs text-ink/60">{formatDateTime(notification.createdAt)}</span>
              </div>
              <h2 className="mt-2 font-semibold text-ink">{notification.title}</h2>
              <p className="mt-1 text-sm text-ink/80">{notification.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {!notification.isRead ? (
                  <Button
                    type="button"
                    variant="secondary"
                    isLoading={markRead.isPending && pendingId === notification.id}
                    onClick={() => {
                      setPendingId(notification.id);
                      markRead.mutate(notification.id, {
                        onSuccess: () => toast.success('Notification marked read.'),
                        onError: (error) => toast.error(getErrorMessage(error)),
                      });
                    }}
                  >
                    Mark read
                  </Button>
                ) : null}
                {notification.taskId ? (
                  <Button type="button" variant="ghost" onClick={() => navigate(paths.task(notification.taskId ?? ''))}>
                    Open task
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {notifications.data ? (
        <Pagination
          pagination={notifications.data.pagination}
          onPageChange={(page) => setParams((current) => replaceParam(current, 'page', String(page), false))}
        />
      ) : null}
    </div>
  );
}
