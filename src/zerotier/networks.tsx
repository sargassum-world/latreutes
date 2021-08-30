import React from 'react';
import {
  QueryClient,
  UseQueryResult,
  UseMutationResult,
  useQueryClient,
  useQuery,
  useMutation,
} from 'react-query';
import { Response } from '@tauri-apps/api/http';

import {
  QUERY_KEY_ZT,
  fetcher,
  invalidateCache,
  ErrorRenderer,
} from './service';

// Queries

interface Route {
  target: string;
  via: string | null;
}

interface NetworkStatus {
  id: string;
  mac: string;
  name: string;
  status: string;
  type: string;
  mtu: number;
  dhcp: boolean;
  bridge: boolean;
  broadcastEnabled: boolean;
  portError: number;
  netconfRevision: number;
  assignedAddresses: string[];
  routes: Route[];
  portDeviceName: string;
  allowManaged: boolean;
  allowGlobal: boolean;
  allowDefault: boolean;
  allowDNS: boolean;
}

const QUERY_KEY = [...QUERY_KEY_ZT, 'networks'];
const QUERY_REFETCH = 0.5; // s
const ROUTE = ['network'];
export const useNetworksStatus = (
  authToken: string
): UseQueryResult<Response<NetworkStatus[]>, Error> =>
  useQuery(QUERY_KEY, fetcher<NetworkStatus[]>(ROUTE, 'GET', authToken), {
    retry: false,
    refetchInterval: QUERY_REFETCH * 1000,
    cacheTime: Infinity,
  });
export const useNetworkJoiner = (
  authToken: string,
  queryClient: QueryClient
): UseMutationResult<Response<NetworkStatus>, unknown, string> =>
  useMutation(
    (networkId: string) =>
      fetcher<NetworkStatus>([...ROUTE, networkId], 'POST', authToken)(),
    {
      onSuccess: () => {
        invalidateCache(queryClient);
      },
    }
  );
export const useNetworkLeaver = (
  networkId: string,
  authToken: string,
  queryClient: QueryClient
): UseMutationResult<Response<NetworkStatus>, unknown, void> =>
  useMutation(
    fetcher<NetworkStatus>([...ROUTE, networkId], 'DELETE', authToken),
    {
      onSuccess: () => {
        invalidateCache(queryClient);
      },
    }
  );

// Components

interface NetworkProps {
  network: NetworkStatus;
  authToken: string;
}
function Network({ network, authToken }: NetworkProps) {
  const queryClient = useQueryClient();
  const networkLeaver = useNetworkLeaver(network.id, authToken, queryClient);

  return (
    <>
      <h3>{network.id}</h3>
      <button type="button" onClick={() => networkLeaver.mutate()}>
        Leave
      </button>
      <table>
        <tr>
          <th>Proposed Name</th>
          <td>{network.name}</td>
        </tr>
        <tr>
          <th>Network ID</th>
          <td>{network.id}</td>
        </tr>
        <tr>
          <th>Type</th>
          <td>{network.type}</td>
        </tr>
        <tr>
          <th>Status</th>
          <td>{network.status}</td>
        </tr>
        <tr>
          <th>Network Interface</th>
          <td>{network.portDeviceName}</td>
        </tr>
        <tr>
          <th>IP Addresses</th>
          <td>
            <ul>
              {network.assignedAddresses?.map((address) => (
                <li>{address}</li>
              ))}
            </ul>
          </td>
        </tr>
      </table>
    </>
  );
}

interface Props {
  authToken: string;
}
function Networks({ authToken }: Props): JSX.Element {
  const queryClient = useQueryClient();
  const {
    data: networksResponse,
    status,
    error,
  } = useNetworksStatus(authToken);
  const networkJoiner = useNetworkJoiner(authToken, queryClient);

  const renderedError = ErrorRenderer(status, error);
  if (renderedError !== undefined) {
    return renderedError;
  }

  if (networksResponse === undefined) {
    return <p>Error: response is undefined even though request succeeded.</p>;
  }

  const networks = networksResponse.data;

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as typeof e.target & {
            networkId: { value: string };
          };
          const {
            networkId: { value: networkId },
          } = target;
          networkJoiner.mutate(networkId);
        }}
      >
        Network ID:{' '}
        <input
          type="text"
          name="networkId"
          placeholder="Enter a ZeroTier network ID"
          size={20}
        />
        <input
          type="submit"
          disabled={networkJoiner.isLoading}
          value={networkJoiner.isLoading ? 'Joining...' : 'Join'}
        />
      </form>
      {networks.map((network) => (
        <Network network={network} authToken={authToken} />
      ))}
    </>
  );
}

export default Networks;
