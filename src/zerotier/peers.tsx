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
  const [clock, setClock] = useState(0)
  const [peers, setPeers] = useState<PeerStatus[]>([])

  useEffect(() => {
    const clockUpdater = setInterval(() => {
      setClock(new Date().getTime())
    }, 500)
    return () => {
      clearInterval(clockUpdater)
    }
  }, [])

  useEffect(() => {
    if (!authToken) {
      return
    }

    async function reloadResult() {
      const response = await fetch<PeerStatus[]>(
        'http://127.0.0.1:9993/peer',
        {
          method: 'GET',
          headers: {
            'X-ZT1-Auth': authToken
          }
        }
      )
      if (response.data !== undefined && Object.keys(response.data).length > 0) {
        setPeers(response.data)
      }
    }
    reloadResult()
  }, [clock, authToken])

  return (
    <>
      {peers.map(
        (peer: PeerStatus) =>
          <div>
            <h3>{peer.address}</h3>
            <table>
              <tr><th>Node ID</th><td>{peer.address}</td></tr>
              <tr><th>Role</th><td>{peer.role}</td></tr>
              <tr><th>Estimated Latency</th><td>{peer.latency}</td></tr>
              <tr>
                <th>Paths</th>
                <td><ul>{peer.paths?.map(
                  (path: Path) =>
                    <li>
                      {path.address} {''}
                      {path.active ? '' : '(Inactive)'}
                      {path.expired ? '(Expired)' : ''}
                      {path.preferred ? '(Preferred)' : ''}<br />
                      Last sent {((new Date().getTime() - path.lastSend) / 1000).toFixed(1)} seconds ago<br />
                      Last received {((new Date().getTime() - path.lastReceive) / 1000).toFixed(1)} seconds ago
                    </li>
                )}</ul></td>
              </tr>
            </table>
          </div>
      ) }
    </>
  )
}

export default PeersInfo
