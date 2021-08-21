import React, { useState, useEffect } from 'react'
import { fetch } from '@tauri-apps/api/http'

interface Props {
  authToken: string
}

interface Path {
  address: string
  lastSend: number
  lastReceive: number
  active: boolean
  expired: boolean
  preferred: boolean
  trustedPathId: number
}

interface PeerStatus {
  address?: string
  versionMajor?: number
  versionMinor?: number
  versionRev?: number
  version?: string
  latency: number
  role?: string
  paths?: Path[]
}

function PeersInfo({authToken}: Props) {
  const [refreshCounter, setRefreshCounter] = useState(0)
  const [peers, setPeers] = useState<PeerStatus[]>([])

  useEffect(() => {
    if (!authToken) {
      return
    }

    async function refreshResult() {
      console.log(authToken)
      const response = await fetch<PeerStatus[]>(
        'http://127.0.0.1:9993/peer',
        {
          method: 'GET',
          headers: {
            'X-ZT1-Auth': authToken
          }
        }
      )
      setPeers(response.data)
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
      {peers.map(
        (peer: PeerStatus) =>
          <>
            <h3>{peer.address}</h3>
            <ul>
              <li>Address: {peer.address}</li>
              <li>Role: {peer.role}</li>
              <li>Estimated latency: {peer.latency}</li>
              <li>
                Paths:
                <ul>{peer.paths?.map(
                  (path: Path) =>
                    <li>
                      {path.address} {''}
                      {path.active ? '' : '(Inactive)'}
                      {path.expired ? '(Expired)' : ''}
                      {path.preferred ? '(Preferred)' : ''},<br />
                      last sent {(new Date().getTime() - path.lastSend) / 1000} seconds ago,
                      last received {(new Date().getTime() - path.lastReceive) / 1000} seconds ago
                    </li>
                )}</ul>
              </li>
            </ul>
          </>
      ) }
    </>
  )
}

export default PeersInfo
