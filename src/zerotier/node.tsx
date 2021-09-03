import React from 'react';
import { UseQueryResult, useQuery } from 'react-query';
import { Response } from '@tauri-apps/api/http';
import { Heading, Tag, Text, Code } from '@chakra-ui/react';

import { useVersion } from '../shared/config';
import { InfoCard } from '../shared/layout';

import { QUERY_KEY_ZT, fetcher, ErrorRenderer } from './service';

// Queries

interface NodeStatus {
  address: string;
  publicIdentity: string;
  planetWorldId: number;
  planetWorldTimestamp: number;
  online: boolean;
  tcpFallbackActive: boolean;
  relayPolicy: string;
  versionMajor: number;
  versionMinor: number;
  versionRef: number;
  version: string;
  clock: number;
}

const QUERY_KEY = [...QUERY_KEY_ZT, 'node'];
const QUERY_REFETCH = 1; // s
const ROUTE = ['status'];
export const useNodeStatus = (
  authToken: string
): UseQueryResult<Response<NodeStatus>, Error> =>
  useQuery(QUERY_KEY, fetcher<NodeStatus>(ROUTE, 'GET', authToken), {
    retry: false,
    refetchInterval: QUERY_REFETCH * 1000,
    cacheTime: Infinity,
  });

// Components

interface Props {
  authToken: string;
}
function NodeInfoCard({ authToken }: Props): JSX.Element {
  const { data: nodeResponse, status, error } = useNodeStatus(authToken);
  const { data: version } = useVersion();

  const renderedError = ErrorRenderer(status, error);
  if (renderedError !== undefined) {
    return renderedError;
  }

  if (nodeResponse === undefined) {
    return (
      <Text>Error: response is undefined even though request succeeded.</Text>
    );
  }

  const node = nodeResponse.data;
  return (
    <InfoCard width="100%">
      <Heading as="h2" size="lg">
        This Device
      </Heading>
      <Heading as="h3" size="sm" mt={2}>
        ZeroTier Address
      </Heading>
      <Text>
        <Code colorScheme="blue">{node.address}</Code>
      </Text>
      <Heading as="h3" size="sm" mt={2}>
        Connection Status
      </Heading>
      <Text>
        {node.online && !node.tcpFallbackActive && (
          <Tag colorScheme="green" variant="solid">
            Connected
          </Tag>
        )}
        {node.online && node.tcpFallbackActive && (
          <Tag colorScheme="pink" variant="solid">
            On Slow Relay
          </Tag>
        )}
        {!node.online && (
          <Tag colorScheme="red" variant="solid">
            Not Connected
          </Tag>
        )}
      </Text>
      <Heading as="h3" size="sm" mt={2}>
        Software Versions
      </Heading>
      <Text>ZeroTier: {node.version}</Text>
      {version !== undefined && <Text>Latreutes: {version}</Text>}
    </InfoCard>
  );
}

export default NodeInfoCard;
