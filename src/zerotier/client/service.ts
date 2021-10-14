import {
  QueryClient,
  UseQueryStoreResult,
  useQuery,
} from '@sveltestack/svelte-query';
import { HttpVerb, Response, fetch } from '@tauri-apps/api/http';

export const QUERY_KEY_ZT = ['latreutes', 'zerotier'];
export const SERVICE_PORT_ZT = 9993;
export const SERVICE_HOST_ZT = '127.0.0.1';
export const SERVICE_URL_ZT = `http://${SERVICE_HOST_ZT}:${SERVICE_PORT_ZT}`;

// Types

export type Empty = Record<string, never>;

export enum ApiStatus {
  failedRequest = 'failed-request',
  incorrectService = 'incorrect-service',
  success = 'success',
}

// Query functions

export function fetcher<ResponseData>(
  route: string[],
  method: HttpVerb,
  authToken?: string,
  emptyError = false,
) {
  return async (): Promise<Response<ResponseData>> => {
    let response;
    if (!authToken) {
      throw new Error(
        `Missing ZeroTier auth token for ${method} ${route.join('/')}!`,
      );
    }

    try {
      response = await fetch<ResponseData | Empty>(
        [SERVICE_URL_ZT, ...route].join('/'),
        { method, headers: { 'X-ZT1-Auth': authToken } },
      );
    } catch (e) {
      throw new Error(
        `Could not connect to the ZeroTier service for ${method} ${route.join(
          '/',
        )}! Is it running?`,
      );
    }

    if (response.status === 401) {
      throw new Error(
        `Not authorized to issue requests to the ZeroTier service! Is the ZeroTier auth token correct? (${method} ${route.join(
          '/',
        )})`,
      );
    }

    if (response.status === 404) {
      throw new Error(
        `Missing resource (${method} ${route.join('/')})! Is the resource nonexistent?`,
      );
    }

    if (response.status !== 200) {
      throw new Error(
        `Unexpected HTTP response code ${response.status}! Is some other service running at ${SERVICE_URL_ZT} instead of ZeroTier?`,
      );
    }

    if (
      emptyError &&
      response.data instanceof Object &&
      Object.keys(response.data).length === 0
    ) {
      throw new Error(
        `Unexpected empty response for ${method} ${route.join(
          '/',
        )}! Is the ZeroTier auth token correct?`,
      );
    }

    return response as Response<ResponseData>;
  };
}

// Parameters

const QUERY_KEY = [...QUERY_KEY_ZT, 'api'];
const QUERY_REFETCH = 1; // s
const API_ROUTE = ['status'];

// Queries

export const useApiStatus = (): UseQueryStoreResult<
  ApiStatus,
  Error,
  ApiStatus,
  string[]
> =>
  useQuery(
    QUERY_KEY,
    async () => {
      let response;

      try {
        response = await fetch<unknown>(
          [SERVICE_URL_ZT, ...API_ROUTE].join('/'),
        );
      } catch (e) {
        return ApiStatus.failedRequest;
      }

      if (response.status !== 401) {
        return ApiStatus.incorrectService;
      }

      if (
        response.data instanceof Object &&
        Object.keys(response.data).length === 0
      ) {
        return ApiStatus.success;
      }

      return ApiStatus.incorrectService;
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchInterval: QUERY_REFETCH * 1000,
      cacheTime: Infinity,
    },
  );

// Utility functions

export const invalidateCache = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries(QUERY_KEY_ZT, { refetchInactive: true });
};
