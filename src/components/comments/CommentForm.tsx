import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useCreateComment } from '../../hooks/useComments';
import { getErrorMessage } from '../../lib/api';
import { applyFieldErrors } from '../../lib/formErrors';
import { commentSchema, type CommentFormValues } from '../../schemas/comment';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';

export function CommentForm({ taskId }: { taskId: string }) {
  const createComment = useCreateComment(taskId);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit((values) => {
        createComment.mutate(values.content.trim(), {
          onSuccess: () => reset({ content: '' }),
          onError: (error) => applyFieldErrors(error, setError),
        });
      })}
    >
      {createComment.isError ? <Alert tone="error">{getErrorMessage(createComment.error)}</Alert> : null}
      {createComment.isSuccess ? <Alert tone="success">Comment added.</Alert> : null}
      <TextArea
        label="Comment"
        name="content"
        registration={register('content')}
        error={errors.content?.message}
        hint="1–5000 characters."
      />
      <Button type="submit" isLoading={createComment.isPending}>
        Add comment
      </Button>
    </form>
  );
}
