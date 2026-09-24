import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDeleteComment, useUpdateComment, useComments } from '../../hooks/useComments';
import { useMe } from '../../hooks/useAuth';
import { getErrorMessage } from '../../lib/api';
import { formatDateTime } from '../../lib/dates';
import { applyFieldErrors } from '../../lib/formErrors';
import { canModifyComment } from '../../lib/permissions';
import { PAGE_SIZE } from '../../lib/params';
import { commentSchema, type CommentFormValues } from '../../schemas/comment';
import type { Comment } from '../../types/api';
import { ErrorState, LoadingState } from '../layout/AsyncState';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Modal } from '../ui/Modal';
import { Pagination } from '../ui/Pagination';
import { TextArea } from '../ui/TextArea';

export function CommentList({ taskId }: { taskId: string }) {
  const me = useMe();
  const [page, setPage] = useState(1);
  const comments = useComments(taskId, { page, limit: PAGE_SIZE });
  const updateComment = useUpdateComment(taskId);
  const deleteComment = useDeleteComment(taskId);
  const [editing, setEditing] = useState<Comment | null>(null);
  const [deleting, setDeleting] = useState<Comment | null>(null);
  const editForm = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    values: { content: editing?.content ?? '' },
  });

  if (comments.isPending) {
    return <LoadingState label="Loading comments" />;
  }
  if (comments.isError) {
    return <ErrorState error={comments.error} onRetry={() => void comments.refetch()} />;
  }

  const rows = comments.data?.data ?? [];
  const pagination = comments.data?.pagination;

  return (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <EmptyState title="No comments yet" description="Comments on this task will show up here." />
      ) : (
        <ul className="space-y-3">
          {rows.map((comment) => {
            const edited = comment.updatedAt !== comment.createdAt;
            const canModify = me.data ? canModifyComment(me.data, comment) : false;
            return (
              <li key={comment.id} className="rounded-2xl border border-sand bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-ink">{comment.user.name}</p>
                  <p className="text-xs text-ink/60">
                    {formatDateTime(comment.createdAt)}
                    {edited ? ' · Edited' : ''}
                  </p>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{comment.content}</p>
                {canModify ? (
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        updateComment.reset();
                        setEditing(comment);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => {
                        deleteComment.reset();
                        setDeleting(comment);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      {pagination && pagination.totalPages > 1 ? (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          onPageChange={setPage}
        />
      ) : null}
      <Modal
        open={Boolean(editing)}
        title="Edit comment"
        description="Only the author or an administrator can change this comment."
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-comment" isLoading={updateComment.isPending}>
              Save comment
            </Button>
          </>
        }
      >
        <form
          id="edit-comment"
          className="space-y-3"
          onSubmit={editForm.handleSubmit((values) => {
            if (!editing) {
              return;
            }
            updateComment.mutate(
              { id: editing.id, content: values.content.trim() },
              {
                onSuccess: () => setEditing(null),
                onError: (error) => applyFieldErrors(error, editForm.setError),
              },
            );
          })}
        >
          {updateComment.isError ? <Alert tone="error">{getErrorMessage(updateComment.error)}</Alert> : null}
          <TextArea
            label="Comment"
            name="content"
            registration={editForm.register('content')}
            error={editForm.formState.errors.content?.message}
          />
        </form>
      </Modal>
      <Modal
        open={Boolean(deleting)}
        title="Delete this comment?"
        description="This cannot be undone."
        onClose={() => setDeleting(null)}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={deleteComment.isPending}
              onClick={() => {
                if (!deleting) {
                  return;
                }
                deleteComment.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
              }}
            >
              Delete comment
            </Button>
          </>
        }
      >
        {deleteComment.isError ? <Alert tone="error">{getErrorMessage(deleteComment.error)}</Alert> : null}
      </Modal>
    </div>
  );
}
