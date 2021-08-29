import React from 'react'
import { HttpVerb, Response, fetch } from '@tauri-apps/api/http'
import { QueryClient } from 'react-query'

export const QUERY_KEY_ZT = ['latreutes', 'zerotier']
const SERVICE_HOST_ZT = 'http://127.0.0.1:9993'

type Empty = Record<any, never>

export const fetcher = <ResponseData extends Object>(
  route: string[],
  method: HttpVerb,
  authToken: string,
) => async () => {
  let response
  try {
    response = await fetch<ResponseData | Empty>(
      [SERVICE_HOST_ZT, ...route].join('/'),
      { method, headers: { 'X-ZT1-Auth': authToken } },
    )
  } catch (e) {
    throw new Error('Could not connect to the ZeroTier driver. Is it running?')
  }
  if (Object.keys(response.data).length === 0) {
    throw new Error('Empty response! Is the ZeroTier auth token correct?')
  }
  return response as Response<ResponseData>
}

export const invalidateCache = (queryClient: QueryClient) => {
  queryClient.invalidateQueries(QUERY_KEY_ZT, { refetchInactive: true })
}

export function ErrorRenderer(status: 'idle' | 'error' | 'loading' | 'success', error: any) {
  switch (status) {
    case 'idle':
    case 'loading':
      return <p>Loading...</p>
    case 'error':
      if (error instanceof Error) {
        return <p>Error: {(error as Error).message}</p>
      }
      return <p>Error: unknown</p>
  }
}
