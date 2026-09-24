import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, compactParams, requestData, requestList } from '../lib/api';
import { endpoints } from '../lib/endpoints';
import { queryKeys } from '../lib/queryKeys';
import type { Comment, PaginationParams, SuccessResponse } from '../types/api';

export function useComments(taskId: string, filters: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.comments.list(taskId, filters),
    queryFn: () =>
      requestList<Comment>(api.get(endpoints.tasks.comments(taskId), { params: compactParams(filters) })),
    placeholderData: keepPreviousData,
    enabled: taskId.length > 0,
  });
}

export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      requestData(api.post<SuccessResponse<Comment>>(endpoints.tasks.comments(taskId), { content })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.all() });
    },
  });
}

export function useUpdateComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; content: string }) =>
      requestData(api.patch<SuccessResponse<Comment>>(endpoints.comments.byId(input.id), { content: input.content })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
  });
}

export function useDeleteComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(endpoints.comments.byId(id));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
  });
}
