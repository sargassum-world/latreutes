import { UseQueryStoreResult, useQuery } from '@sveltestack/svelte-query';

import { QUERY_KEY_ZT, fetcher } from './service';
import { Status, Type } from './network';

// Types

export interface NetworkSummary {
  id: string;
  name: string;
  status: Status;
  type: Type;
  bridge: boolean;
  portError: number;
}

// Parameters

const QUERY_KEY = [...QUERY_KEY_ZT, 'networks'];
const QUERY_REFETCH = 1.0; // s
const API_ROUTE = ['network'];

// Queries

export const useNetworkSummaries = (
  authToken: string | undefined,
  refetchInterval: number | false = QUERY_REFETCH * 1000,
): UseQueryStoreResult<NetworkSummary[], Error, NetworkSummary[], string[]> =>
  useQuery(
    QUERY_KEY,
    async (): Promise<NetworkSummary[]> => {
      const result = await fetcher<NetworkSummary[]>(
        API_ROUTE,
        'GET',
        authToken,
        false,
      )();
      return result.data.map(
        ({ id, name, status, type, bridge, portError }): NetworkSummary => ({
          id,
          name,
          status,
          type,
          bridge,
          portError,
        }),
      );
    },
    {
      enabled: !!authToken,
      retry: false,
      refetchInterval,
      cacheTime: Infinity,
    },
  );
