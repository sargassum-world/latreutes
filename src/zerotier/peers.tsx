import React from 'react';
import { UseQueryResult, useQuery } from 'react-query';
import { Response } from '@tauri-apps/api/http';

import { QUERY_KEY_ZT, fetcher, ErrorRenderer } from './service';

// Queries

interface PathStatus {
  address: string;
  lastSend: number;
  lastReceive: number;
  active: boolean;
  expired: boolean;
  preferred: boolean;
  trustedPathId: number;
}

interface PeerStatus {
  address: string;
  versionMajor: number;
  versionMinor: number;
  versionRev: number;
  version: string;
  latency: number;
  role: string;
  paths: PathStatus[];
}

const QUERY_KEY = [...QUERY_KEY_ZT, 'peers'];
const QUERY_REFETCH = 0.5; // s
const ROUTE = ['peer'];
export const usePeersStatus = (
  authToken: string
): UseQueryResult<Response<PeerStatus[]>, Error> =>
  useQuery(QUERY_KEY, fetcher<PeerStatus[]>(ROUTE, 'GET', authToken), {
    retry: false,
    refetchInterval: QUERY_REFETCH * 1000,
    cacheTime: Infinity,
  });

// Components

interface PathProps {
  path: PathStatus;
}
function Path({ path }: PathProps) {
  return (
    <li>
      {path.address}
      {path.active ? '' : '(Inactive)'}
      {path.expired ? '(Expired)' : ''}
      {path.preferred ? '(Preferred)' : ''}
      <br />
      Last sent {((new Date().getTime() - path.lastSend) / 1000).toFixed(
        1
      )}{' '}
      seconds ago
      <br />
      Last received{' '}
      {((new Date().getTime() - path.lastReceive) / 1000).toFixed(1)} seconds
      ago
    </li>
  );
}

interface PeerProps {
  peer: PeerStatus;
}
function Peer({ peer }: PeerProps) {
  return (
    <div>
      <h3>{peer.address}</h3>
      <table>
        <tr>
          <th>Node ID</th>
          <td>{peer.address}</td>
        </tr>
        <tr>
          <th>Role</th>
          <td>{peer.role}</td>
        </tr>
        <tr>
          <th>Estimated Latency (ms)</th>
          <td>{peer.latency >= 0 ? peer.latency : 'N/A'}</td>
        </tr>
        <tr>
          <th>Paths</th>
          <td>
            {peer.paths.length === 0 ? (
              'No paths found'
            ) : (
              <ul>
                {peer.paths?.map((path) => (
                  <Path path={path} />
                ))}
              </ul>
            )}
          </td>
        </tr>
      </table>
    </div>
  );
}

interface Props {
  authToken: string;
}

function Peers({ authToken }: Props): JSX.Element {
  const { data: peersResponse, status, error } = usePeersStatus(authToken);

  const renderedError = ErrorRenderer(status, error);
  if (renderedError !== undefined) {
    return renderedError;
  }

  if (peersResponse === undefined) {
    return <p>Error: response is undefined even though request succeeded.</p>;
  }

  const peers = peersResponse.data;

  return (
    <>
      <h2>ZeroTier Root Servers</h2>
      {peers
        .filter(
          (peer: PeerStatus) => peer.role === 'PLANET' || peer.role === 'MOON'
        )
        .map((peer: PeerStatus) => (
          <Peer peer={peer} />
        ))}
      <h2>Leaf Peers</h2>
      {peers
        .filter((peer: PeerStatus) => peer.role === 'LEAF')
        .map((peer: PeerStatus) => (
          <Peer peer={peer} />
        ))}
    </>
  );
}

export default Peers;
