import React, { useState, useEffect } from 'react'
import { fetch, HttpVerb } from '@tauri-apps/api/http'

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
  const [clock, setClock] = useState(0)
  const [networkId, setNetworkId] = useState<string>('')
  const [submittedNetworkId, setSubmittedNetworkId] = useState<string>('')
  const [joinLeaveAction, setJoinLeaveAction] = useState('')
  const [joinLeaveCounter, setJoinLeaveCounter] = useState(0)
  const [networks, setNetworks] = useState<NetworkStatus[]>([])

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
      const response = await fetch<NetworkStatus[]>(
        'http://127.0.0.1:9993/network',
        {
          method: 'GET',
          headers: {
            'X-ZT1-Auth': authToken
          }
        }
      )
      if (response.data !== undefined && Object.keys(response.data).length > 0) {
        setNetworks(response.data)
      }
    }
    reloadResult()
  }, [clock, authToken])

  useEffect(() => {
    if (!authToken || !submittedNetworkId) {
      return
    }

    async function joinNetwork() {
      let method: HttpVerb = 'GET'
      switch (joinLeaveAction) {
        case 'join':
          method = 'POST'
          break
        case 'leave':
          method = 'DELETE'
          break
      }
      await fetch<NetworkStatus[]>(
        `http://127.0.0.1:9993/network/${submittedNetworkId}`,
        {
          method: method,
          headers: {
            'X-ZT1-Auth': authToken
          }
        }
      )
    }
    joinNetwork()
  }, [submittedNetworkId, joinLeaveAction, joinLeaveCounter, authToken])

  return (
    <>
      <p>
        Network ID: <input
          type='text'
          value={networkId}
          placeholder='Enter a ZeroTier network ID'
          onChange={e => setNetworkId(e.target.value)}
          size={20}
        />
        <button onClick={() => {
          setSubmittedNetworkId(networkId)
          setJoinLeaveCounter(joinLeaveCounter + 1)
          setJoinLeaveAction('join')
        }}>
          Join Network
        </button>
        <button onClick={() => {
          setSubmittedNetworkId(networkId);
          setJoinLeaveAction('leave')
        }}>
          Leave Network
        </button>
      </p>
      {networks.map(
        (network: NetworkStatus) =>
          <>
            <h3>{network.id}</h3>
            <table>
              <tr><th>Proposed Name</th><td>{network.name}</td></tr>
              <tr><th>Network ID</th><td>{network.id}</td></tr>
              <tr><th>Type</th><td>{network.type}</td></tr>
              <tr><th>Status</th><td>{network.status}</td></tr>
              <tr><th>Network Interface</th><td>{network.portDeviceName}</td></tr>
              <tr>
                <th>IP Addresses</th>
                <td><ul>
                  {network.assignedAddresses?.map((address: string) => <li>{address}</li>)}
                </ul></td>
              </tr>
            </table>
          </>
      ) }
    </>
  )
}

export default NetworksInfo
