import React, { useState, useEffect } from 'react'
import { fetch } from '@tauri-apps/api/http'

interface Props {
  authToken: string
}

interface Route {
  target: string
  via: string | null
}

interface NetworkStatus {
  id?: string
  mac?: string
  name?: string
  status?: string
  type?: string
  mtu?: number
  dhcp?: boolean
  bridge?: boolean
  broadcastEnabled?: boolean
  portError?: number
  netconfRevision?: number
  assignedAddresses?: string[]
  routes?: Route[]
  portDeviceName?: string
  allowManaged?: boolean
  allowGlobal?: boolean
  allowDefault?: boolean
  allowDNS?: boolean
}

function NetworksInfo({authToken}: Props) {
  const [refreshCounter, setRefreshCounter] = useState(0)
  const [networks, setNetworks] = useState<NetworkStatus[]>([])

  useEffect(() => {
    if (!authToken) {
      return
    }

    async function refreshResult() {
      console.log(authToken)
      const response = await fetch<NetworkStatus[]>(
        'http://127.0.0.1:9993/network',
        {
          method: 'GET',
          headers: {
            'X-ZT1-Auth': authToken
          }
        }
      )
      setNetworks(response.data)
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
      {networks.map(
        (network: NetworkStatus) =>
          <>
            <h3>{network.id}</h3>
            <ul>
              <li>Proposed Name: {network.name}</li>
              <li>ID: {network.id}</li>
              <li>Type: {network.type}</li>
              <li>Status: {network.status}</li>
              <li>Network interface: {network.portDeviceName}</li>
              <li>
                IP addresses:
                <ul>
                  {network.assignedAddresses?.map((address: string) => <li>{address}</li>)}
                </ul>
              </li>
            </ul>
          </>
      ) }
    </>
  )
}

export default NetworksInfo
