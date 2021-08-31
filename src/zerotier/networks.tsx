import React, { useState } from 'react';
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
  Flex,
  Stack,
  Wrap,
  WrapItem,
  Drawer,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerHeader,
  DrawerContent,
  DrawerBody,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Input,
  Heading,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

import useTxtResolver from '../dns/lookup';
import { SubmenuContainer, ContentContainer } from '../shared/layout';

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
  authToken: string,
  refetchInterval: number | false = QUERY_REFETCH * 1000
): UseQueryResult<Response<NetworkStatus[]>, Error> =>
  useQuery(
    QUERY_KEY,
    fetcher<NetworkStatus[]>(ROUTE, 'GET', authToken, false),
    {
      retry: false,
      refetchInterval,
      cacheTime: Infinity,
    }
  );
export const useNetworkStatus = (
  networkId: string,
  authToken: string,
  refetchInterval: number | false = QUERY_REFETCH * 1000,
  cacheTime = Infinity
): UseQueryResult<Response<NetworkStatus>, Error> =>
  useQuery(
    [...QUERY_KEY, networkId],
    fetcher<NetworkStatus>([...ROUTE, networkId], 'GET', authToken),
    {
      retry: false,
      refetchInterval,
      cacheTime,
    }
  );
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

interface NetworkIdJoinerProps {
  networkId: string;
  authToken: string;
}
function NetworkIdJoiner({ networkId, authToken }: NetworkIdJoinerProps) {
  const queryClient = useQueryClient();
  const networkJoiner = useNetworkJoiner(authToken, queryClient);
  const [joined, setJoined] = useState(false);
  const { data: networkResponse, isLoading } = useNetworkStatus(
    networkId,
    authToken,
    QUERY_REFETCH * 1000,
    QUERY_REFETCH * 1000
  );

  if (!networkId || isLoading) {
    return <></>;
  }

  // Bug: if NetworkIdJoiner is merely redrawn when the props change, rather than
  // being destroyed and created again, then joined will not reset, even though
  // we want it to reset!
  if (joined) {
    return <Text>Attempted to join {networkId}!</Text>;
  }

  if (networkResponse !== undefined) {
    const network = networkResponse.data;
    if (network.id === networkId) {
      return (
        <Text>
          This device has already joined the network with ZeroTier network&nbsp;
          ID <Text as="samp">{networkId}.</Text>
        </Text>
      );
    }
  }

  networkJoiner.mutate(networkId);
  setJoined(true);
  return <Text>Joining {networkId}...</Text>;
}

const DNS_TXT_ZT_NETWORK_KEY = 'zerotier-net-id';

interface HostnameJoinerProps {
  hostname: string;
  authToken: string;
}
function HostnameJoiner({ hostname, authToken }: HostnameJoinerProps) {
  const { data: txtRecords, status } = useTxtResolver(hostname);

  if (!hostname) {
    return <></>;
  }

  switch (status) {
    case 'idle':
    case 'loading':
      return <Text>Loading...</Text>;
    case 'error':
      return (
        <Text>
          Error: Could not find any records at the provided hostname.
          <br />
          Did you enter a valid hostname? Are you connected to the internet, or
          at least to the server which stores the records for the hostname?
        </Text>
      );
    default:
      if (txtRecords === undefined) {
        return <Text>Error: unknown</Text>;
      }
  }

  const ztNetworkIdRecordPrefix = `${DNS_TXT_ZT_NETWORK_KEY}=`;
  const ztNetworkIdRecords = txtRecords.filter((record) =>
    record.startsWith(ztNetworkIdRecordPrefix)
  );
  if (ztNetworkIdRecords.length === 0) {
    return (
      <Text>
        Error: could not find any ZeroTier Network IDs published at the
        hostname!
        <br />
        Did you enter a valid hostname?
      </Text>
    );
  }
  if (ztNetworkIdRecords.length > 1) {
    return (
      <Text>
        Error: multiple ZeroTier Network IDs are published at the hostname!
      </Text>
    );
  }
  const ztNetworkId = ztNetworkIdRecords[0].slice(
    ztNetworkIdRecordPrefix.length
  );
  if (ztNetworkId.length === 0) {
    return (
      <Text>
        Error: the ZeroTier Network ID published at the hostname is empty! Did
        the operator of the hostname incorrectly configure their public records?
      </Text>
    );
  }

  return (
    <>
      <Text>
        The network at <Text as="samp">{hostname}</Text> has ZeroTier&nbsp;
        network ID <Text as="samp">{ztNetworkId}</Text>.
      </Text>
      <NetworkIdJoiner networkId={ztNetworkId} authToken={authToken} />
    </>
  );
}

interface JoinerFormProps {
  onClose(): void;
  authToken: string;
}
enum IdentifierType {
  hostname = 'hostname',
  networkId = 'networkId',
}
function JoinerForm({ onClose, authToken }: JoinerFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState(IdentifierType.hostname);
  const [submitted, setSubmitted] = useState(false);

  if (identifier && submitted) {
    let joiner;
    switch (identifierType) {
      case IdentifierType.hostname:
        joiner = <HostnameJoiner hostname={identifier} authToken={authToken} />;
        break;
      default:
        joiner = (
          <NetworkIdJoiner networkId={identifier} authToken={authToken} />
        );
        break;
    }
    return (
      <Stack pt={4}>
        {joiner}
        <ButtonGroup colorScheme="teal">
          <Button
            onClick={() => {
              setSubmitted(false);
            }}
          >
            Join Another Network
          </Button>
          <Button onClick={onClose}>Close</Button>
        </ButtonGroup>
      </Stack>
    );
  }

  let identifierTitle = 'Identifier';
  let identifierPlaceholder = 'Identifier for the network';
  switch (identifierType) {
    case IdentifierType.hostname:
      identifierTitle = 'Network Hostname';
      identifierPlaceholder = 'Hostname for the network';
      break;
    case IdentifierType.networkId:
      identifierTitle = 'ZeroTier Network ID';
      identifierPlaceholder = 'ZeroTier Network ID for the network';
      break;
    default:
      break;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const target = e.target as typeof e.target & {
          identifier: { value: string };
        };
        const {
          identifier: { value: submittedIdentifier },
        } = target;
        switch (identifierType) {
          case IdentifierType.hostname: {
            let submittedHostname = '';
            try {
              submittedHostname = new URL(submittedIdentifier).hostname;
            } catch {
              submittedHostname = submittedIdentifier;
            }
            setIdentifier(submittedHostname);
            break;
          }
          default: {
            setIdentifier(submittedIdentifier);
            break;
          }
        }
        setSubmitted(true);
      }}
    >
      <Stack pt={4} spacing={4}>
        <FormControl id="identifier" isRequired>
          <FormLabel>Identifier Type</FormLabel>
          <RadioGroup
            onChange={(value) => {
              switch (value) {
                case 'hostname':
                  setIdentifierType(IdentifierType.hostname);
                  break;
                default:
                  setIdentifierType(IdentifierType.networkId);
                  break;
              }
            }}
            value={identifierType}
          >
            <Stack direction="row">
              <Radio value="hostname">Hostname</Radio>
              <Radio value="networkId">Network ID</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
        <FormControl id="identifier" isRequired>
          <FormLabel>{identifierTitle}</FormLabel>
          <Input
            type="text"
            name="identifier"
            placeholder={identifierPlaceholder}
          />
        </FormControl>
        <Box>
          <Button type="submit" colorScheme="teal">
            Join
          </Button>
        </Box>
      </Stack>
    </form>
  );
}

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

interface NetworksListProps {
  authToken: string;
}
function NetworksList({ authToken }: NetworksListProps): JSX.Element {
  const {
    data: networksResponse,
    status,
    error,
  } = useNetworksStatus(authToken);

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
  const hasAnyNetworks = networks.length > 0;
  const authorizedNetworks = networks.filter(
    (network) => network.status === 'OK'
  );
  const hasAuthorizedNetworks = authorizedNetworks.length > 0;
  const unauthorizedNetworks = networks.filter(
    (network) => network.status === 'ACCESS_DENIED'
  );
  const hasUnauthorizedNetworks = unauthorizedNetworks.length > 0;
  const otherNetworks = networks.filter(
    (network) => network.status !== 'OK' && network.status !== 'ACCESS_DENIED'
  );
  const hasOtherNetworks = otherNetworks.length > 0;

  return (
    <ContentContainer pad>
      {!hasAnyNetworks && (
        <>
          <Heading mb={6} size="xl">
            Welcome!
          </Heading>
          <Text>
            This device is not part of any networks! You can join a network by
            pressing the &quot;Join a Network&quot; button above, or you can
            host your own network by pressing the &quot;Host a Network&quot;
            button above.
          </Text>
        </>
      )}
      {hasAuthorizedNetworks && (
        <Box py={4}>
          <Heading as="h2" size="xl" py={4}>
            Authorized Networks
          </Heading>
          <Wrap spacing={8}>
            {authorizedNetworks.map((network) => (
              <WrapItem width="28em">
                <Network network={network} authToken={authToken} />
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}
      {hasUnauthorizedNetworks && (
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
      {hasOtherNetworks && (
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
    </ContentContainer>
  );
}

interface Props {
  authToken: string;
}
function Networks({ authToken }: Props): JSX.Element {
  const {
    isOpen: isJoinOpen,
    onOpen: onJoinOpen,
    onClose: onJoinClose,
  } = useDisclosure();
  const {
    isOpen: isHostOpen,
    onOpen: onHostOpen,
    onClose: onHostClose,
  } = useDisclosure();

  return (
    <Flex direction="column">
      <SubmenuContainer>
        <ButtonGroup colorScheme="teal">
          <Button onClick={onJoinOpen}>Join a Network</Button>
          <Button onClick={onHostOpen}>Host a Network</Button>
        </ButtonGroup>
      </SubmenuContainer>
      <Drawer
        placement="right"
        size="sm"
        onClose={onJoinClose}
        isOpen={isJoinOpen}
      >
        <DrawerOverlay />
        <DrawerContent style={{ overflow: 'auto' }}>
          <DrawerCloseButton />
          <DrawerHeader>Join a Network</DrawerHeader>
          <DrawerBody>
            <Text>
              You can join a network by providing the network&apos;s identifier
              as either a hostname or URL (such as&nbsp;
              <Text as="samp">prakashlab.dedyn.io</Text>) or a ZeroTier network
              ID (such as <Text as="samp">1c33c1ced015c144</Text>).
            </Text>
            <JoinerForm onClose={onJoinClose} authToken={authToken} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Drawer
        placement="right"
        size="sm"
        onClose={onHostClose}
        isOpen={isHostOpen}
      >
        <DrawerOverlay />
        <DrawerContent style={{ overflow: 'auto' }}>
          <DrawerCloseButton />
          <DrawerHeader>Host a Network</DrawerHeader>
          <DrawerBody>
            <Text>This feature is not implemented yet!</Text>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <NetworksList authToken={authToken} />
    </Flex>
  );
}

export default Networks;
