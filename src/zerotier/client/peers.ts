import type { UseQueryStoreResult } from '@sveltestack/svelte-query';
import { useQuery } from '@sveltestack/svelte-query';

import { QUERY_KEY_ZT, fetcher } from './service';
import type { Role } from './peer';

// Types

export interface PeerSummary {
  address: string;
  role: Role;
}

// Parameters

const QUERY_KEY = [...QUERY_KEY_ZT, 'peers'];
const QUERY_REFETCH = 2.0; // s
const API_ROUTE = ['peer'];

// Queries

export const usePeerSummaries = (
  authToken: string | undefined,
): UseQueryStoreResult<PeerSummary[], Error, PeerSummary[], string[]> =>
  useQuery(
    QUERY_KEY,
    async (): Promise<PeerSummary[]> => {
      const result = await fetcher<PeerSummary[]>(
        API_ROUTE,
        'GET',
        authToken,
        false,
      )();
      return result.data.map(({ address, role }) => ({ address, role }));
    },
    {
      enabled: !!authToken,
      retry: false,
      refetchInterval: QUERY_REFETCH * 1000,
      cacheTime: Infinity,
    },
  );
