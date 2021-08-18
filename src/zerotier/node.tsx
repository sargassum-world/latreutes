import React, { useState, useEffect } from 'react'
import { fetch } from '@tauri-apps/api/http'

interface Props {
  authToken: string
}

interface NodeStatus {
  address?: string
  publicIdentity?: string
  worldId?: number
  worldTimestamp?: number
  online?: boolean
  tcpFallbackActive?: boolean
  relayPolicy?: string
  versionMajor?: number
  versionMinor?: number
  versionRef?: number
  version?: string
  clock?: number
}

function NodeInfo({authToken}: Props) {
  const [refreshCounter, setRefreshCounter] = useState(0)
  const [address, setAddress] = useState<string | undefined>()
  const [online, setOnline] = useState<boolean | undefined>()
  const [onFallback, setOnFallback] = useState<boolean | undefined>()

  useEffect(() => {
    if (!authToken) {
      return
    }

    async function refreshResult() {
      const response = await fetch<NodeStatus>(
        'http://127.0.0.1:9993/status',
        {
          method: 'GET',
          headers: {
            'X-ZT1-Auth': authToken
          }
        }
      )
      setAddress(response.data.address)
      setOnline(response.data.online)
      setOnFallback(response.data.tcpFallbackActive)
    }
    refreshResult()
  }, [refreshCounter, authToken])

  return (
    <>
      <p>
        <button onClick={() => setRefreshCounter(refreshCounter + 1)}>
          Refresh
        </button>
      </p>
      <p>
        Node ID: {address}
      </p>
      <p>
        Status: {online ? (onFallback ? 'Slow' : 'Online') : 'Offline'}
      </p>
    </>
  )
}

export default NodeInfo
