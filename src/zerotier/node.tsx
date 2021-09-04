import React from 'react';
import { UseQueryResult, useQuery } from 'react-query';
import { Response } from '@tauri-apps/api/http';
import { Heading, Tag, Text, Code } from '@chakra-ui/react';

import { useVersion } from '../shared/config';
import { InfoCard } from '../shared/layout';

import { QUERY_KEY_ZT, fetcher } from './service';
import { ApiStatus, useApiStatus } from './api';

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

export const QUERY_KEY = [...QUERY_KEY_ZT, 'node'];
const QUERY_REFETCH = 1; // s
export const ROUTE = ['status'];
export const useNodeStatus = (
  authToken: string | undefined,
  emptyError = true
): UseQueryResult<Response<NodeStatus>, Error> =>
  useQuery(
    QUERY_KEY,
    fetcher<NodeStatus>(ROUTE, 'GET', authToken, emptyError),
    {
      enabled: !!authToken,
      retry: false,
      refetchInterval: QUERY_REFETCH * 1000,
      cacheTime: Infinity,
    }
  );

// Components

interface Props {
  authToken: string;
}
function ZeroTierInfoCard({ authToken }: Props) {
  const { data: nodeResponse } = useNodeStatus(authToken);
  const { data: version } = useVersion();
  const node = nodeResponse !== undefined ? nodeResponse.data : undefined;

  return (
    <InfoCard width="100%">
      <Heading as="h2" size="lg">
        This Device
      </Heading>
      <Heading as="h3" size="sm" mt={2}>
        ZeroTier Address
      </Heading>
      <Text>
        {node === undefined ? (
          <Tag colorScheme="red" variant="solid">
            Unknown
          </Tag>
        ) : (
          <Code colorScheme="blue">{node.address}</Code>
        )}
      </Text>
      <Heading as="h3" size="sm" mt={2}>
        Connection Status
      </Heading>
      <Text>
        {node !== undefined && node.online && !node.tcpFallbackActive && (
          <Tag colorScheme="green" variant="solid">
            Connected
          </Tag>
        )}
        {node !== undefined && node.online && node.tcpFallbackActive && (
          <Tag colorScheme="pink" variant="solid">
            On Slow Relay
          </Tag>
        )}
        {(node === undefined || !node.online) && (
          <Tag colorScheme="red" variant="solid">
            Not Connected
          </Tag>
        )}
      </Text>
      <Heading as="h3" size="sm" mt={2}>
        Software Versions
      </Heading>
      <Text>
        ZeroTier:{' '}
        {node === undefined ? (
          <Tag colorScheme="red" variant="solid" mb={1}>
            Unknown
          </Tag>
        ) : (
          <>{node.version}</>
        )}
      </Text>
      <Text>
        Latreutes:{' '}
        {version === undefined ? (
          <Tag colorScheme="red" variant="solid">
            Unknown
          </Tag>
        ) : (
          <>{version}</>
        )}
      </Text>
    </InfoCard>
  );
}
function NodeInfoCard({ authToken }: Props): JSX.Element {
  const { data: apiStatus } = useApiStatus();
  const { data: version } = useVersion();

  if (version === undefined) {
    return (
      <InfoCard width="100%">
        <Heading as="h2" size="lg">
          Oops!
        </Heading>
        <Text>
          It looks like you&apos;re trying to run this program in a web browser.
          If so, you should run the desktop application version of this program
          instead &ndash; this program does not work in the browser.
        </Text>
        <Text>
          If you are running this program in development mode (e.g. using the{' '}
          <Code>yarn tauri dev</Code> command), the desktop application window
          should launch soon.
        </Text>
      </InfoCard>
    );
  }

  if (apiStatus === ApiStatus.success) {
    return <ZeroTierInfoCard authToken={authToken} />;
  }

  return (
    <InfoCard width="100%">
      <Heading as="h2" size="lg">
        This Device
      </Heading>
      <Heading as="h3" size="sm" mt={2}>
        Software Version
      </Heading>
      <Text>
        Latreutes:{' '}
        {version === undefined ? (
          <Tag colorScheme="red" variant="solid">
            Unknown
          </Tag>
        ) : (
          <>{version}</>
        )}
      </Text>
    </InfoCard>
  );
}

export default NodeInfoCard;
