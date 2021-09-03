import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { Stack, Wrap, WrapItem, Heading, Link, Text } from '@chakra-ui/react';

import { InfoCard } from '../../shared/layout';
import AuthInfoCard from '../../zerotier/auth';
import NodeInfoCard from '../../zerotier/node';
import { useNetworksStatus } from '../../zerotier/networks/service';

function WelcomeInfoCard(): JSX.Element {
  return (
    <InfoCard width="100%">
      <Stack spacing={2}>
        <Heading as="h1" size="xl">
          Welcome!
        </Heading>
        <Text>
          This program wants to make it easy for you to manage your connections
          to ZeroTier virtual networks, and to host your own networks.
        </Text>
        <Text>
          ZeroTier virtual networks help you connect programs running on your
          device directly and securely to programs on other devices anywhere in
          the world, without requiring you to do the complex network
          configuration needed to make your device easy and safe to access over
          the public internet.
        </Text>
        <Text>
          To get started, please click on the{' '}
          <Link to="/networks" as={RouterNavLink} variant="colored">
            Networks
          </Link>{' '}
          button in the navigation menu.
        </Text>
      </Stack>
    </InfoCard>
  );
}

interface Props {
  configDirPath: string | undefined;
  authToken: string | undefined;
  authTokenStatus: string;
}
function HomePage({
  configDirPath,
  authToken,
  authTokenStatus,
}: Props): JSX.Element {
  const { data: networksResponse, status } = useNetworksStatus(
    authToken !== undefined ? authToken : ''
  );

  const hasNoNetworks =
    status === 'success' &&
    networksResponse !== undefined &&
    networksResponse.data.length === 0;

  return (
    <Wrap py={4} spacing={4}>
      {authToken === undefined && (
        <WrapItem width="50em">
          <AuthInfoCard
            configDirPath={configDirPath}
            tokenStatus={authTokenStatus}
          />
        </WrapItem>
      )}
      {hasNoNetworks && (
        <WrapItem width="24em">
          <WelcomeInfoCard />
        </WrapItem>
      )}
      {authToken !== undefined && (
        <WrapItem width="24em">
          <NodeInfoCard authToken={authToken} />
        </WrapItem>
      )}
    </Wrap>
  );
}

export default HomePage;
