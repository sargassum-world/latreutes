import React from 'react';
import { UseQueryResult, useQuery } from 'react-query';
import { Response } from '@tauri-apps/api/http';
import { Text, Code } from '@chakra-ui/react';

import { QUERY_KEY_ZT, fetcher, ErrorRenderer } from './service';

// Queries

interface NodeStatus {
  address: string;
  publicIdentity: string;
  worldId: number;
  worldTimestamp: number;
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
function Node({ authToken }: Props): JSX.Element {
  const { data: nodeResponse, status, error } = useNodeStatus(authToken);

  const renderedError = ErrorRenderer(status, error);
  if (renderedError !== undefined) {
    return renderedError;
  }

  if (nodeResponse === undefined) {
    return (
      <Text>Error: response is undefined even though request succeeded.</Text>
    );
  }

  const { address, online, tcpFallbackActive: onFallback } = nodeResponse.data;
  let statusMessage = 'Offline';
  if (online) {
    statusMessage = onFallback ? 'Slow' : 'Online';
  }

  return (
    <>
      <Text>
        Node ID: <Code colorScheme="blue">{address}</Code>
      </Text>
      <Text>Status: {statusMessage}</Text>
    </>
  );
}

export default Node;
