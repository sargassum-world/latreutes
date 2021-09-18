import React from 'react';
import { UseQueryResult, useQueryClient, useQuery } from 'react-query';
import { fetch } from '@tauri-apps/api/http';
import { Stack, Button, Heading, Text, Code } from '@chakra-ui/react';

import { InfoCard } from '../shared/layout';
import { useShellOpener } from '../shared/shell';

import { QUERY_KEY_ZT, SERVICE_URL_ZT, invalidateCache } from './service';

// Queries

export enum ApiStatus {
  failedRequest = 'failed-request',
  incorrectService = 'incorrect-service',
  success = 'success',
}

export const QUERY_KEY = [...QUERY_KEY_ZT, 'api'];
const QUERY_REFETCH = 1; // s
export const ROUTE = ['status'];
export const useApiStatus = (): UseQueryResult<ApiStatus, Error> =>
  useQuery(
    QUERY_KEY,
    async () => {
      let response;

      try {
        response = await fetch<unknown>([SERVICE_URL_ZT, ...ROUTE].join('/'));
      } catch (e) {
        return ApiStatus.failedRequest;
      }

      if (response.status !== 401) {
        return ApiStatus.incorrectService;
      }

      if (
        response.data instanceof Object &&
        Object.keys(response.data).length === 0
      ) {
        return ApiStatus.success;
      }

      return ApiStatus.incorrectService;
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchInterval: QUERY_REFETCH * 1000,
      cacheTime: Infinity,
    }
  );

// Components
const ZT_DOWNLOAD_URL = 'https://zerotier.com/download/';

function StatusMessage() {
  const { data: apiStatusResponse, error } = useApiStatus();
  const shellOpener = useShellOpener();

  switch (apiStatusResponse) {
    case ApiStatus.failedRequest:
      return (
        <Stack spacing={2}>
          <Text>
            In order for this program to work, your computer needs to be running
            the ZeroTier service. If you haven&apos;t already installed
            ZeroTier, you will need to install it from:
            <br />
            <Button
              variant="ghost"
              p={0}
              fontWeight={400}
              userSelect="auto"
              onClick={() => shellOpener.mutate(ZT_DOWNLOAD_URL)}
            >
              <Code>{ZT_DOWNLOAD_URL}</Code>
            </Button>
            <br />
            Once you&apos;ve installed ZeroTier, press the &quot;Try Again&quot;
            button:
          </Text>
          <Text>{!!error && error.message}</Text>
        </Stack>
      );
    case ApiStatus.incorrectService:
      return (
        <Stack spacing={2}>
          <Text>
            In order for this program to work, your computer needs to be running
            the ZeroTier service so that it&apos;s accessible at{' '}
            <Code>{SERVICE_URL_ZT}</Code>. There is a service running at that
            URL, but it does not behave in the expected way. It is likely that
            some other service is running there, and the ZeroTier service might
            not be running.
          </Text>
          <Text>{!!error && error.message}</Text>
        </Stack>
      );
    default:
      return <>API Status: {apiStatusResponse}</>;
  }
}

function ApiInfoCard(): JSX.Element {
  const queryClient = useQueryClient();

  return (
    <InfoCard width="100%">
      <Heading as="h2" size="lg">
        Run the ZeroTier Service
      </Heading>
      <StatusMessage />
      <Text>
        <Button
          onClick={() => {
            invalidateCache(queryClient);
          }}
          colorScheme="teal"
          mt={2}
        >
          Try Again
        </Button>
      </Text>
    </InfoCard>
  );
}

export default ApiInfoCard;
