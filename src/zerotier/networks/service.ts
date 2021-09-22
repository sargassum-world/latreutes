import {
  QueryClient,
  UseQueryResult,
  UseMutationResult,
  useQuery,
  useMutation,
} from 'react-query';
import { Response } from '@tauri-apps/api/http';

import { QUERY_KEY_ZT, fetcher, invalidateCache } from '../service';

export interface Route {
  target: string;
  via: string | null;
}

type Status =
  | 'REQUESTING_CONFIGURATION'
  | 'OK'
  | 'ACCESS_DENIED'
  | 'NOT_FOUND'
  | 'PORT_ERROR'
  | 'CLIENT_TOO_OLD';

export interface NetworkStatus {
  id: string;
  mac: string;
  name: string;
  status: Status;
  type: string;
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

const QUERY_KEY = [...QUERY_KEY_ZT, 'networks'];
export const QUERY_REFETCH = 1.0; // s
const ROUTE = ['network'];
export const useNetworksStatus = (
  authToken: string | undefined,
  refetchInterval: number | false = QUERY_REFETCH * 1000,
): UseQueryResult<Response<NetworkStatus[]>, Error> =>
  useQuery(
    QUERY_KEY,
    fetcher<NetworkStatus[]>(ROUTE, 'GET', authToken, false),
    {
      enabled: !!authToken,
      retry: false,
      refetchInterval,
      cacheTime: Infinity,
    },
  );
export const useNetworkStatus = (
  networkId: string,
  authToken: string | undefined,
  refetchInterval: number | false = QUERY_REFETCH * 1000,
  cacheTime = Infinity,
): UseQueryResult<Response<NetworkStatus>, Error> =>
  useQuery(
    [...QUERY_KEY, networkId],
    fetcher<NetworkStatus>([...ROUTE, networkId], 'GET', authToken),
    {
      enabled: !!authToken,
      retry: false,
      refetchInterval,
      cacheTime,
    },
  );
export const useNetworkJoiner = (
  authToken: string,
  queryClient: QueryClient,
): UseMutationResult<Response<NetworkStatus>, unknown, string> =>
  useMutation(
    (networkId: string) =>
      fetcher<NetworkStatus>([...ROUTE, networkId], 'POST', authToken)(),
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
): UseMutationResult<Response<NetworkStatus>, unknown, void> =>
  useMutation(
    fetcher<NetworkStatus>([...ROUTE, networkId], 'DELETE', authToken),
    {
      onSuccess: () => {
        invalidateCache(queryClient);
      },
    },
  );
