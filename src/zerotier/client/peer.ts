import { UseQueryStoreResult, useQuery } from '@sveltestack/svelte-query';
import { Response } from '@tauri-apps/api/http';

import { QUERY_KEY_ZT, fetcher } from './service';

// Types

export type Role = 
  | 'LEAF'
  | 'UPSTREAM'
  | 'ROOT'
  | 'PLANET'

interface PathInfo {
  address: string;
  lastSend: number;
  lastReceive: number;
  active: boolean;
  expired: boolean;
  preferred: boolean;
  trustedPathId: number;
}

interface PeerInfo {
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
const QUERY_REFETCH = 0.5; // s
const API_ROUTE_BASE = ['peer'];

// Queries

export const usePeerInfo = (
  peerId: string,
  authToken: string | undefined
): UseQueryStoreResult<Response<PeerInfo>, Error, Response<PeerInfo>, string[]> =>
  useQuery(
    [...QUERY_KEY_BASE, peerId],
    fetcher<PeerInfo>([...API_ROUTE_BASE, peerId], 'GET', authToken),
    {
      enabled: !!authToken,
      retry: false,
      refetchInterval: QUERY_REFETCH * 1000,
      cacheTime: Infinity,
    }
  );
