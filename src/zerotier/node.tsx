import React from 'react'
import { useQuery } from 'react-query'

import { QUERY_KEY_ZT, fetcher, ErrorRenderer } from './service'

// Queries

interface NodeStatus {
  address: string
  publicIdentity: string
  worldId: number
  worldTimestamp: number
  online: boolean
  tcpFallbackActive: boolean
  relayPolicy: string
  versionMajor: number
  versionMinor: number
  versionRef: number
  version: string
  clock: number
}

const QUERY_KEY = [...QUERY_KEY_ZT, 'node']
const QUERY_REFETCH = 1  // s
const ROUTE = ['status']
export const useNodeStatus = (authToken: string) => useQuery(
  QUERY_KEY,
  fetcher<NodeStatus>(ROUTE, 'GET', authToken),
  { retry: false, refetchInterval: QUERY_REFETCH * 1000, cacheTime: Infinity },
)

// Components

interface Props {
  authToken: string
}
function Node({authToken}: Props) {
  const { data: nodeResponse, status, error } = useNodeStatus(authToken)

  const renderedError = ErrorRenderer(status, error)
  if (renderedError !== undefined) {
    return renderedError
  }

  const { address, online, tcpFallbackActive: onFallback } = nodeResponse!.data

  return (
    <>
      <p>
        Node ID: {address}
      </p>
      <p>
        Status: {online ? (onFallback ? 'Slow' : 'Online') : 'Offline'}
      </p>
    </>
  )
}

export default Node
