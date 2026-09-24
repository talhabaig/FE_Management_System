import { useQuery } from '@tanstack/react-query';
import { api, compactParams, requestData } from '../lib/api';
import { endpoints } from '../lib/endpoints';
import { queryKeys } from '../lib/queryKeys';
import type { DashboardFilters, DashboardSummary, SuccessResponse } from '../types/api';

export function useDashboardSummary(filters: DashboardFilters, enabled = true) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(filters),
    queryFn: () =>
      requestData(api.get<SuccessResponse<DashboardSummary>>(endpoints.dashboard.summary, { params: compactParams(filters) })),
    enabled,
  });
}
