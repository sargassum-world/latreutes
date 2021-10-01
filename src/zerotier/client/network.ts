import {
  QueryClient,
  UseQueryStoreResult,
  MutationStoreResult,
  useQuery,
  useMutation,
} from '@sveltestack/svelte-query';
import { Response } from '@tauri-apps/api/http';

import { QUERY_KEY_ZT, fetcher, invalidateCache } from './service';
import DNS_ZT_NETWORK_KEY from './dns';

// Types

export interface Route {
  target: string;
  via: string | null;
}
interface NetworkSplitId {
  hostAddress: string;
  networkNumber: string;
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
): UseQueryStoreResult<
  Response<NetworkInfo>,
  Error,
  Response<NetworkInfo>,
  string[]
> =>
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

export const prefetchNetworkInfo = (
  networkId: string,
  authToken: string | undefined,
  queryClient: QueryClient,
): Promise<void> =>
  queryClient.prefetchQuery(
    [...QUERY_KEY_BASE, networkId],
    fetcher<NetworkInfo>([...API_ROUTE_BASE, networkId], 'GET', authToken),
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

// Utilities

export function isNetworkId(identifier: string): boolean {
  const networkIdRegex = /^[a-z\d]{16}$/i;
  return networkIdRegex.test(identifier);
}

export function splitNetworkId(networkId: string): NetworkSplitId {
  return {
    hostAddress: networkId.slice(0, 10),
    networkNumber: networkId.slice(10),
  };
}

export function checkNetworkDomainName(
  networkName: string,
  networkId: string,
  txtRecords: string[] | undefined,
  status: string,
): boolean {
  if (status !== 'success' || txtRecords === undefined) {
    return false;
  }

  const ztNetworkIdRecordPrefix = `${DNS_ZT_NETWORK_KEY}=`;
  const ztNetworkIdRecords = txtRecords.filter((record) =>
    record.startsWith(ztNetworkIdRecordPrefix),
  );
  if (ztNetworkIdRecords.length !== 1) {
    return false;
  }

  const ztNetworkId = ztNetworkIdRecords[0].slice(
    ztNetworkIdRecordPrefix.length,
  );
  return ztNetworkId === networkId;
}
