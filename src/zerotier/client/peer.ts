import type {
  QueryClient,
  UseQueryStoreResult,
} from '@sveltestack/svelte-query';
import { useQuery } from '@sveltestack/svelte-query';
import { Response } from '@tauri-apps/api/http';

import { QUERY_KEY_ZT, fetcher } from './service';

// Types

export type Role = 'LEAF' | 'UPSTREAM' | 'ROOT' | 'PLANET' | 'MOON';

export interface PathInfo {
  address: string;
  lastSend: number;
  lastReceive: number;
  active: boolean;
  expired: boolean;
  preferred: boolean;
  trustedPathId: number;
}

export interface PeerInfo {
  address: string;
  versionMajor: number;
  versionMinor: number;
  versionRev: number;
  version: string;
  latency: number;
  role: Role;
  paths: PathInfo[];
}

// Parameters

const QUERY_KEY_BASE = [...QUERY_KEY_ZT, 'peer'];
const QUERY_REFETCH = 2.0; // s
const API_ROUTE_BASE = ['peer'];

// Queries

export const usePeerInfo = (
  address: string,
  authToken: string | undefined,
): UseQueryStoreResult<
  Response<PeerInfo>,
  Error,
  Response<PeerInfo>,
  string[]
> =>
  useQuery(
    [...QUERY_KEY_BASE, address],
    fetcher<PeerInfo>([...API_ROUTE_BASE, address], 'GET', authToken),
    {
      enabled: !!authToken,
      retry: false,
      refetchInterval: QUERY_REFETCH * 1000,
      cacheTime: Infinity,
    },
  );

export const prefetchPeerInfo = (
  address: string,
  authToken: string | undefined,
  queryClient: QueryClient,
): Promise<void> =>
  queryClient.prefetchQuery(
    [...QUERY_KEY_BASE, address],
    fetcher<PeerInfo>([...API_ROUTE_BASE, address], 'GET', authToken),
  );
