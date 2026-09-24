import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, compactParams, requestData, requestList } from '../lib/api';
import { endpoints } from '../lib/endpoints';
import { queryKeys } from '../lib/queryKeys';
import type { MarkAllReadResult, Notification, PaginationParams, SuccessResponse } from '../types/api';

export function useNotifications(filters: PaginationParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: () =>
      requestList<Notification>(api.get(endpoints.notifications.list, { params: compactParams(filters) })),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      requestData(api.patch<SuccessResponse<Notification>>(endpoints.notifications.read(id))),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => requestData(api.patch<SuccessResponse<MarkAllReadResult>>(endpoints.notifications.readAll)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
    },
  });
}
