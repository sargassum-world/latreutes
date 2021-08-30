import React from 'react';
import { QueryClient } from 'react-query';
import { HttpVerb, Response, fetch } from '@tauri-apps/api/http';

export const QUERY_KEY_ZT = ['latreutes', 'zerotier'];
const SERVICE_HOST_ZT = 'http://127.0.0.1:9993';

type Empty = Record<string, never>;

export function fetcher<ResponseData>(
  route: string[],
  method: HttpVerb,
  authToken: string
) {
  return async (): Promise<Response<ResponseData>> => {
    let response;
    try {
      response = await fetch<ResponseData | Empty>(
        [SERVICE_HOST_ZT, ...route].join('/'),
        { method, headers: { 'X-ZT1-Auth': authToken } }
      );
    } catch (e) {
      throw new Error(
        'Could not connect to the ZeroTier driver. Is it running?'
      );
    }
    if (
      response.data instanceof Object &&
      Object.keys(response.data).length === 0
    ) {
      throw new Error('Empty response! Is the ZeroTier auth token correct?');
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
      return <p>Loading...</p>;
    case 'error':
      if (error === null) {
        return <p>Error: unknown</p>;
      }
      return <p>Error: {error.message}</p>;
    default:
      return undefined;
  }
}
