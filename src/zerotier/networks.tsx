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
  Box,
  Wrap,
  WrapItem,
  Button,
  Input,
  Heading,
  Text,
} from '@chakra-ui/react';

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

type Status =
  | 'REQUESTING_CONFIGURATION'
  | 'OK'
  | 'ACCESS_DENIED'
  | 'NOT_FOUND'
  | 'PORT_ERROR'
  | 'CLIENT_TOO_OLD';

interface NetworkStatus {
  id: string;
  mac: string;
  name: string;
  status: Status;
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
    <Box>
      <Heading as="h3" size="md">
        {network.id}
      </Heading>
      <Button onClick={() => networkLeaver.mutate()}>Leave</Button>
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
    </Box>
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
    return (
      <Text>Error: response is undefined even though request succeeded.</Text>
    );
  }

  const networks = networksResponse.data;
  const joinedNetworks = networks.filter((network) => network.status === 'OK');
  const unauthorizedNetworks = networks.filter(
    (network) => network.status === 'ACCESS_DENIED'
  );
  const otherNetworks = networks.filter(
    (network) => network.status !== 'OK' && network.status !== 'ACCESS_DENIED'
  );

  return (
    <>
      <Heading as="h2" size="xl" py={4}>
        Join a Network
      </Heading>
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
        <Input
          type="text"
          name="networkId"
          placeholder="Enter a ZeroTier network ID"
        />
        <Button type="submit" disabled={networkJoiner.isLoading}>
          {networkJoiner.isLoading ? 'Joining...' : 'Join'}
        </Button>
      </form>
      {joinedNetworks.length > 0 && (
        <Box py={4}>
          <Heading as="h2" size="xl" py={4}>
            Joined Networks
          </Heading>
          <Wrap spacing={8}>
            {joinedNetworks.map((network) => (
              <WrapItem width="28em">
                <Network network={network} authToken={authToken} />
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}
      {unauthorizedNetworks.length > 0 && (
        <Box py={4}>
          <Heading as="h2" size="xl" py={4}>
            Unauthorized Networks
          </Heading>
          <Wrap spacing={8}>
            {unauthorizedNetworks.map((network) => (
              <WrapItem width="28em">
                <Network network={network} authToken={authToken} />
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}
      {otherNetworks.length > 0 && (
        <Box py={4}>
          <Heading as="h2" size="xl" py={4}>
            Other Networks
          </Heading>
          <Wrap spacing={8}>
            {otherNetworks.map((network) => (
              <WrapItem width="28em">
                <Network network={network} authToken={authToken} />
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}
    </>
  );
}

export default Networks;
