import type { UseQueryStoreResult } from '@sveltestack/svelte-query';
import { useQuery } from '@sveltestack/svelte-query';
import { Response } from '@tauri-apps/api/http';

import { QUERY_KEY_ZT, fetcher } from './service';

// Types

interface NodeInfo {
  address: string;
  publicIdentity: string;
  planetWorldId: number;
  planetWorldTimestamp: number;
  online: boolean;
  tcpFallbackActive: boolean;
  relayPolicy: string;
  versionMajor: number;
  versionMinor: number;
  versionRef: number;
  version: string;
  clock: number;
}

// Parameters

const QUERY_KEY = [...QUERY_KEY_ZT, 'node'];
const QUERY_REFETCH = 1.0; // s
const API_ROUTE = ['status'];

// Queries

export const useNodeInfo = (
  authToken: string | undefined,
  emptyError = true,
): UseQueryStoreResult<
  Response<NodeInfo>,
  Error,
  Response<NodeInfo>,
  string[]
> =>
  useQuery(
    QUERY_KEY,
    fetcher<NodeInfo>(API_ROUTE, 'GET', authToken, emptyError),
    {
      enabled: !!authToken,
      retry: false,
      refetchInterval: QUERY_REFETCH * 1000,
      cacheTime: Infinity,
    },
  );
