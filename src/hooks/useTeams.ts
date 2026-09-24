import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, compactParams, requestData, requestList } from '../lib/api';
import { endpoints } from '../lib/endpoints';
import { queryKeys } from '../lib/queryKeys';
import type {
  CreateTeamInput,
  PaginationParams,
  SuccessResponse,
  Team,
  TeamListFilters,
  TeamMember,
  UpdateTeamInput,
} from '../types/api';

export function useTeams(filters: TeamListFilters, enabled = true) {
  return useQuery({
    queryKey: queryKeys.teams.list(filters),
    queryFn: () => requestList<Team>(api.get(endpoints.teams.list, { params: compactParams(filters) })),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: queryKeys.teams.detail(id),
    queryFn: () => requestData(api.get<SuccessResponse<Team>>(endpoints.teams.byId(id))),
    enabled: id.length > 0,
  });
}

export function useTeamMembers(teamId: string, filters: PaginationParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.teams.members(teamId, filters),
    queryFn: () =>
      requestList<TeamMember>(api.get(endpoints.teams.members(teamId), { params: compactParams(filters) })),
    placeholderData: keepPreviousData,
    enabled: enabled && teamId.length > 0,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTeamInput) =>
      requestData(api.post<SuccessResponse<Team>>(endpoints.teams.list, input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
    },
  });
}

export function useUpdateTeam(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTeamInput) =>
      requestData(api.patch<SuccessResponse<Team>>(endpoints.teams.byId(id), input)),
    onSuccess: (team) => {
      queryClient.setQueryData(queryKeys.teams.detail(team.id), team);
      void queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(endpoints.teams.byId(id));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
    },
  });
}

export function useAddMember(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      requestData(api.post<SuccessResponse<TeamMember>>(endpoints.teams.members(teamId), { userId })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
    },
  });
}

export function useRemoveMember(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(endpoints.teams.member(teamId, userId));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
    },
  });
}
