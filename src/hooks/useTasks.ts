import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, compactParams, requestData, requestList } from '../lib/api';
import { endpoints } from '../lib/endpoints';
import { queryKeys } from '../lib/queryKeys';
import type {
  CreateTaskInput,
  SuccessResponse,
  Task,
  TaskListFilters,
  TaskStatus,
  UpdateTaskInput,
} from '../types/api';

function invalidateTaskViews(queryClient: ReturnType<typeof useQueryClient>, taskId?: string) {
  if (taskId) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
  }
  void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() });
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
  void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() });
}

export function useTasks(filters: TaskListFilters, enabled = true) {
  return useQuery({
    queryKey: queryKeys.tasks.list(filters),
    queryFn: () => requestList<Task>(api.get(endpoints.tasks.list, { params: compactParams(filters) })),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => requestData(api.get<SuccessResponse<Task>>(endpoints.tasks.byId(id))),
    enabled: id.length > 0,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) =>
      requestData(api.post<SuccessResponse<Task>>(endpoints.tasks.list, input)),
    onSuccess: () => {
      invalidateTaskViews(queryClient);
    },
  });
}

export function useUpdateTask(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTaskInput) =>
      requestData(api.patch<SuccessResponse<Task>>(endpoints.tasks.byId(id), input)),
    onSuccess: (task) => {
      queryClient.setQueryData(queryKeys.tasks.detail(task.id), task);
      invalidateTaskViews(queryClient, task.id);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(endpoints.tasks.byId(id));
    },
    onSuccess: () => {
      invalidateTaskViews(queryClient);
    },
  });
}

export function useAssignTask(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignedToId: string) =>
      requestData(api.post<SuccessResponse<Task>>(endpoints.tasks.assign(id), { assignedToId })),
    onSuccess: (task) => {
      queryClient.setQueryData(queryKeys.tasks.detail(task.id), task);
      invalidateTaskViews(queryClient, task.id);
    },
  });
}

export function useUpdateTaskStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: TaskStatus) =>
      requestData(api.patch<SuccessResponse<Task>>(endpoints.tasks.status(id), { status })),
    onSuccess: (task) => {
      queryClient.setQueryData(queryKeys.tasks.detail(task.id), task);
      invalidateTaskViews(queryClient, task.id);
    },
  });
}
