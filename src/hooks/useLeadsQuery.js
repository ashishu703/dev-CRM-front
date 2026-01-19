// OPTIMIZED: React Query hook for leads with caching
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../api/admin_api/api';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

export function useLeadsQuery(page = 1, limit = 10, filters = {}) {
  const queryClient = useQueryClient();

  const queryKey = ['leads', page, limit, filters];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        includeDocStatus: 'true',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '' && v != null)
        )
      });

      const response = await apiClient.get(
        `${API_ENDPOINTS.SALESPERSON_ASSIGNED_LEADS_ME()}?${params.toString()}`
      );

      return {
        data: response?.data || [],
        pagination: response?.pagination || {},
        total: response?.pagination?.total || 0,
        totalPages: response?.pagination?.totalPages || 1
      };
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME, // Previously cacheTime
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1
  });

  // Prefetch next page
  const prefetchNextPage = () => {
    if (query.data?.pagination?.totalPages > page) {
      queryClient.prefetchQuery({
        queryKey: ['leads', page + 1, limit, filters],
        queryFn: async () => {
          const params = new URLSearchParams({
            page: (page + 1).toString(),
            limit: limit.toString(),
            includeDocStatus: 'true',
            ...Object.fromEntries(
              Object.entries(filters).filter(([_, v]) => v !== '' && v != null)
            )
          });
          const response = await apiClient.get(
            `${API_ENDPOINTS.SALESPERSON_ASSIGNED_LEADS_ME()}?${params.toString()}`
          );
          return {
            data: response?.data || [],
            pagination: response?.pagination || {},
            total: response?.pagination?.total || 0,
            totalPages: response?.pagination?.totalPages || 1
          };
        },
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME
      });
    }
  };

  return {
    ...query,
    prefetchNextPage
  };
}

