import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  api,
  getAccessToken,
  isApiRequestError,
  refreshAccessToken,
  requestData,
  setAccessToken,
} from '../lib/api';
import { endpoints } from '../lib/endpoints';
import { paths } from '../lib/paths';
import { queryKeys } from '../lib/queryKeys';
import type { AuthSession, LoggedOutResult, SuccessResponse, User } from '../types/api';
import type { LoginFormValues, RegisterFormValues } from '../schemas/auth';

export async function restoreSession(): Promise<User | null> {
  if (!getAccessToken()) {
    try {
      await refreshAccessToken();
    } catch (error) {
      setAccessToken(null);
      if (isApiRequestError(error) && (error.status === 401 || error.status === 403)) {
        return null;
      }
      throw error;
    }
  }

  try {
    return await requestData(api.get<SuccessResponse<User>>(endpoints.auth.me));
  } catch (error) {
    if (isApiRequestError(error) && error.status === 401) {
      setAccessToken(null);
      return null;
    }
    throw error;
  }
}

export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: restoreSession,
    retry: false,
    staleTime: 30_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginFormValues) =>
      requestData(
        api.post<SuccessResponse<AuthSession>>(endpoints.auth.login, {
          email: input.email.trim().toLowerCase(),
          password: input.password,
        }),
      ),
    onSuccess: (session) => {
      setAccessToken(session.accessToken);
      queryClient.setQueryData(queryKeys.auth.me(), session.user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterFormValues) =>
      requestData(
        api.post<SuccessResponse<User>>(endpoints.auth.register, {
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          password: input.password,
        }),
      ),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      await api.post<SuccessResponse<LoggedOutResult>>(endpoints.auth.logout);
    },
    onSettled: () => {
      setAccessToken(null);
      queryClient.clear();
      navigate(paths.login, { replace: true });
    },
  });
}
