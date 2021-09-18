import React from 'react';
import { QueryClient } from 'react-query';
import { HttpVerb, Response, fetch } from '@tauri-apps/api/http';
import { Text } from '@chakra-ui/react';

export const QUERY_KEY_ZT = ['latreutes', 'zerotier'];
export const SERVICE_PORT_ZT = 9993;
export const SERVICE_HOST_ZT = '127.0.0.1';
export const SERVICE_URL_ZT = `http://${SERVICE_HOST_ZT}:${SERVICE_PORT_ZT}`;

export type Empty = Record<string, never>;

export function fetcher<ResponseData>(
  route: string[],
  method: HttpVerb,
  authToken?: string,
  emptyError = false
) {
  return async (): Promise<Response<ResponseData>> => {
    let response;
    if (!authToken) {
      throw new Error(`Missing ZeroTier auth token for ${method} ${route}!`);
    }

    try {
      response = await fetch<ResponseData | Empty>(
        [SERVICE_URL_ZT, ...route].join('/'),
        { method, headers: { 'X-ZT1-Auth': authToken } }
      );
    } catch (e) {
      throw new Error(
        `Could not connect to the ZeroTier service for ${method} ${route}! Is it running?`
      );
    }

    if (response.status === 401) {
      throw new Error(
        `Not authorized to issue requests to the ZeroTier service! Is the ZeroTier auth token correct? (${method} ${route})`
      );
    }

    if (response.status !== 200) {
      throw new Error(
        `Unexpected HTTP response code ${response.status}! Is some other service running at ${SERVICE_URL_ZT} instead of ZeroTier?`
      );
    }

    if (
      emptyError &&
      response.data instanceof Object &&
      Object.keys(response.data).length === 0
    ) {
      throw new Error(
        `Unexpected empty response for ${method} ${route}! Is the ZeroTier auth token correct?`
      );
    }

    return response as Response<ResponseData>;
  };
}

export const invalidateCache = (queryClient: QueryClient): void => {
  queryClient.invalidateQueries(QUERY_KEY_ZT, { refetchInactive: true });
};

export function ErrorRenderer(
  status: 'idle' | 'error' | 'loading' | 'success',
  error: Error | null
): JSX.Element | undefined {
  switch (status) {
    case 'idle':
    case 'loading':
      return <Text>Loading...</Text>;
    case 'error':
      if (error === null) {
        return <Text>Error: unknown</Text>;
      }
      return <Text>Error: {error.message}</Text>;
    default:
      return undefined;
  }
}
