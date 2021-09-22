import {
  QueryClient,
  UseQueryStoreResult,
  MutationStoreResult,
  useQuery,
  useMutation,
} from '@sveltestack/svelte-query';
import { Response } from '@tauri-apps/api/http';

import { QUERY_KEY_ZT, fetcher, invalidateCache } from './service';

// Types

export interface Route {
  target: string;
  via: string | null;
}

export type Status =
  | 'REQUESTING_CONFIGURATION'
  | 'OK'
  | 'ACCESS_DENIED'
  | 'NOT_FOUND'
  | 'PORT_ERROR'
  | 'CLIENT_TOO_OLD';

export type Type = 'PUBLIC' | 'PRIVATE';

interface NetworkInfo {
  id: string;
  mac: string;
  name: string;
  status: Status;
  type: Type;
  mtu: number;
  dhcp: boolean;
  bridge: boolean;
  broadcastEnabled: boolean;
  portError: number;
  netconfRevision: number;
  assignedAddresses: string[];
  routes: Route[];
  portDeviceName: string;
  allowManaged: boolean;
  allowGlobal: boolean;
  allowDefault: boolean;
  allowDNS: boolean;
}

// Parameters

const QUERY_KEY_BASE = [...QUERY_KEY_ZT, 'network'];
const QUERY_REFETCH = 1.0; // s
const API_ROUTE_BASE = ['network'];

// Queries

export const useNetworkInfo = (
  networkId: string,
  authToken: string | undefined,
  refetchInterval: number | false = QUERY_REFETCH * 1000,
  cacheTime = Infinity,
): UseQueryStoreResult<Response<NetworkInfo>, Error, Response<NetworkInfo>, string[]> =>
  useQuery(
    [...QUERY_KEY_BASE, networkId],
    fetcher<NetworkInfo>([...API_ROUTE_BASE, networkId], 'GET', authToken),
    {
      enabled: !!authToken,
      retry: false,
      refetchInterval,
      cacheTime,
    },
  );

// Mutations

export const useNetworkJoiner = (
  authToken: string,
  queryClient: QueryClient,
): MutationStoreResult<Response<NetworkInfo>, unknown, string> =>
  useMutation(
    (networkId: string) =>
      fetcher<NetworkInfo>([...API_ROUTE_BASE, networkId], 'POST', authToken)(),
    {
      onSuccess: () => {
        invalidateCache(queryClient);
      },
    },
  );

export const useNetworkLeaver = (
  networkId: string,
  authToken: string,
  queryClient: QueryClient,
): MutationStoreResult<Response<NetworkInfo>, unknown, void> =>
  useMutation(
    fetcher<NetworkInfo>([...API_ROUTE_BASE, networkId], 'DELETE', authToken),
    {
      onSuccess: () => {
        invalidateCache(queryClient);
      },
    },
  );
