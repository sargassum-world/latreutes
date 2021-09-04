import React from 'react';
import { UseQueryResult, useQuery } from 'react-query';
import { Response } from '@tauri-apps/api/http';
import {
  Box,
  Stack,
  Wrap,
  WrapItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tag,
  Heading,
  Text,
  Code,
} from '@chakra-ui/react';

import {
  EntityCard,
  CardHeader,
  CardToolbar,
  CardBody,
  CardFooter,
} from '../shared/layout';
import { useReverseResolver } from '../shared/dns';

import { QUERY_KEY_ZT, fetcher, ErrorRenderer } from './service';
import { NetworkStatus, useNetworksStatus } from './networks/service';
import { NetworkName, splitNetworkId } from './networks/network';

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
  authToken: string | undefined
): UseQueryResult<Response<PeerStatus[]>, Error> =>
  useQuery(QUERY_KEY, fetcher<PeerStatus[]>(ROUTE, 'GET', authToken), {
    enabled: !!authToken,
    retry: false,
    refetchInterval: QUERY_REFETCH * 1000,
    cacheTime: Infinity,
  });

// Components

interface PathProps {
  path: PathStatus;
}
function Path({ path }: PathProps) {
  const { data: reverseRecords, status } = useReverseResolver(
    path.address.split('/')[0]
  );

  return (
    <Box py={2}>
      <Text>
        <Code colorScheme="purple">{path.address}</Code>{' '}
        {!path.active && (
          <Tag colorScheme="pink" variant="solid">
            Inactive
          </Tag>
        )}
        {path.expired && (
          <Tag colorScheme="red" variant="solid">
            Expired
          </Tag>
        )}
        {path.preferred && (
          <Tag colorScheme="green" variant="solid">
            Preferred
          </Tag>
        )}
      </Text>
      {status === 'success' &&
        reverseRecords !== undefined &&
        reverseRecords.map((hostname) => (
          <Code variant="solid">{hostname}</Code>
        ))}
      <Text>
        Last sent {((new Date().getTime() - path.lastSend) / 1000).toFixed(1)} s
        ago
      </Text>
      <Text>
        Last received{' '}
        {((new Date().getTime() - path.lastReceive) / 1000).toFixed(1)} seconds
        ago
      </Text>
    </Box>
  );
}

interface PeerNameProps {
  peer: PeerStatus;
}
function PeerName({ peer }: PeerNameProps) {
  return (
    <Heading as="h3" size="md">
      <Code colorScheme="blue" pr={0} size="md" mb={1} fontWeight={400}>
        {peer.address}
      </Code>
    </Heading>
  );
}

interface PeerProps {
  peer: PeerStatus;
  authToken: string;
}
function ToolbarBadges({ peer, authToken }: PeerProps) {
  const { data: networksResponse, status } = useNetworksStatus(authToken);

  let isNetworkHost = false;
  if (status === 'success' && networksResponse !== undefined) {
    const networks = networksResponse.data;
    const networkHosts = networks.map(
      (network) => splitNetworkId(network.id).hostAddress
    );
    isNetworkHost = networkHosts.includes(peer.address);
  }

  return (
    <>
      {peer.role === 'ROOT' && (
        <Tag colorScheme="green" variant="solid" size="md">
          Root
        </Tag>
      )}
      {peer.role === 'PLANET' && (
        <Tag colorScheme="green" variant="solid" size="md">
          Planet
        </Tag>
      )}
      {peer.role === 'UPSTREAM' && (
        <Tag colorScheme="green" variant="solid" size="md">
          Upstream
        </Tag>
      )}
      {peer.role === 'LEAF' && (
        <>
          <Tag colorScheme="green" variant="solid" size="md">
            Leaf
          </Tag>
        </>
      )}
      {isNetworkHost && (
        <>
          {' '}
          <Tag colorScheme="green" variant="solid" size="md">
            Network Host
          </Tag>
        </>
      )}
    </>
  );
}
function Peer({ peer, authToken }: PeerProps) {
  const { data: networksResponse, status } = useNetworksStatus(authToken);

  let hostedNetworks: NetworkStatus[] = [];
  if (status === 'success' && networksResponse !== undefined) {
    const networks = networksResponse.data;
    hostedNetworks = networks.filter(
      (network) => peer.address === splitNetworkId(network.id).hostAddress
    );
  }

  return (
    <EntityCard width="100%">
      <CardHeader>
        <PeerName peer={peer} />
      </CardHeader>
      <CardToolbar>
        <ToolbarBadges peer={peer} authToken={authToken} />
      </CardToolbar>
      <CardBody>
        <Accordion allowMultiple mt={-4} mb={-6} mx={-4}>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Details
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Heading as="h4" size="sm" mt={2}>
                ZeroTier Address
              </Heading>
              <Code colorScheme="blue" pr={0}>
                {peer.address}
              </Code>
              <Heading as="h4" size="sm" mt={2}>
                Estimated Latency
              </Heading>
              {peer.latency >= 0 ? (
                `${peer.latency} ms`
              ) : (
                <Tag colorScheme="pink" variant="solid">
                  Unknown
                </Tag>
              )}
              <Heading as="h4" size="sm" mt={2}>
                Version
              </Heading>
              {peer.versionMajor >= 0 ? (
                `${peer.versionMajor}.${peer.versionMinor}.${peer.versionRev}`
              ) : (
                <Tag colorScheme="pink" variant="solid">
                  Unknown
                </Tag>
              )}
              <Heading as="h4" size="sm" mt={2}>
                Hosted Networks
              </Heading>
              {hostedNetworks.length > 0 ? (
                hostedNetworks.map((network) => (
                  <Text>
                    <NetworkName network={network} />
                  </Text>
                ))
              ) : (
                <Tag colorScheme="pink" variant="solid">
                  Unknown
                </Tag>
              )}
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Active Physical Paths
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              {peer.paths.length > 0 ? (
                <Stack spacing={0}>
                  {peer.paths?.map((path) => (
                    <Path path={path} />
                  ))}
                </Stack>
              ) : (
                <Tag colorScheme="pink" variant="solid">
                  None
                </Tag>
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </CardBody>
      <CardFooter />
    </EntityCard>
  );
}

interface Props {
  authToken: string;
}

function PeersPage({ authToken }: Props): JSX.Element {
  const { data: peersResponse, status, error } = usePeersStatus(authToken);

  const renderedError = ErrorRenderer(status, error);
  if (renderedError !== undefined) {
    return (
      <Box>
        <Heading as="h1" size="xl" pb={2}>
          Peers
        </Heading>
        {renderedError}
      </Box>
    );
  }

  if (peersResponse === undefined) {
    return (
      <Box>
        <Heading as="h1" size="xl" pb={2}>
          Peers
        </Heading>
        <Text>Error: response is undefined even though request succeeded.</Text>
      </Box>
    );
  }

  const peers = peersResponse.data;
  const rootServers = peers.filter(
    (peer: PeerStatus) => peer.role === 'PLANET' || peer.role === 'MOON'
  );
  const leafPeers = peers.filter((peer: PeerStatus) => peer.role === 'LEAF');

  return (
    <>
      {leafPeers.length > 0 && (
        <Box pt={2} pb={6}>
          <Heading as="h2" size="xl" pb={2}>
            Peers
          </Heading>
          <Text mb={4}>
            This device has the following peers, which may be network hosts, or
            other devices:
          </Text>
          <Wrap spacing={8}>
            {leafPeers.map((peer: PeerStatus) => (
              <WrapItem width="28em">
                <Peer peer={peer} authToken={authToken} />
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}
      {rootServers.length > 0 && (
        <Box pt={2} pb={6}>
          <Heading as="h2" size="xl" pb={2}>
            Peer Introducers
          </Heading>
          <Text mb={4}>
            This device can locate other peers by being mutually introduced
            through one of the following special peers:
          </Text>
          <Wrap spacing={8}>
            {rootServers.map((peer: PeerStatus) => (
              <WrapItem width="28em">
                <Peer peer={peer} authToken={authToken} />
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}
    </>
  );
}

export default PeersPage;
