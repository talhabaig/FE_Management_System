import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, compactParams, requestData, requestList } from '../lib/api';
import { endpoints } from '../lib/endpoints';
import { queryKeys } from '../lib/queryKeys';
import type { SuccessResponse, UpdateUserInput, User, UserListFilters } from '../types/api';

export function useUsers(filters: UserListFilters, enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => requestList<User>(api.get(endpoints.users.list, { params: compactParams(filters) })),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => requestData(api.get<SuccessResponse<User>>(endpoints.users.byId(id))),
    enabled: enabled && id.length > 0,
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserInput) =>
      requestData(api.patch<SuccessResponse<User>>(endpoints.users.byId(id), input)),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.users.detail(user.id), user);
      queryClient.setQueryData<User | null>(queryKeys.auth.me(), (current) =>
        current && current.id === user.id ? user : current,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requestData(api.delete<SuccessResponse<User>>(endpoints.users.byId(id))),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.users.detail(user.id), user);
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
  });
}
