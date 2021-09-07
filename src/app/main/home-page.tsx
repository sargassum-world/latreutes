import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import {
  Stack,
  Wrap,
  WrapItem,
  Heading,
  Link,
  Text,
  Code,
} from '@chakra-ui/react';

import { useVersion } from '../../shared/config';
import { InfoCard } from '../../shared/layout';
import ApiInfoCard, { ApiStatus, useApiStatus } from '../../zerotier/api';
import AuthInfoCard from '../../zerotier/auth';
import NodeInfoCard, { useNodeStatus } from '../../zerotier/node';
import { useNetworksStatus } from '../../zerotier/networks/service';

interface WelcomeInfoProps {
  hasNodeInfo: boolean;
}
function WelcomeInfoCard({ hasNodeInfo }: WelcomeInfoProps) {
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
          device directly to programs on other devices of your choosing,
          anywhere in the world, with a simpler and safer setup process than
          making your device accessible over the public internet.
        </Text>
        {hasNodeInfo && (
          <Text>
            To get started, please click on the{' '}
            <Link to="/networks" as={RouterNavLink} variant="colored">
              Networks
            </Link>{' '}
            button in the navigation menu.
          </Text>
        )}
      </Stack>
    </InfoCard>
  );
}

function BrowserRunInfoCard() {
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
        should automatically launch soon.
      </Text>
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
  const { data: version } = useVersion();
  const { data: apiStatusResponse } = useApiStatus();
  const { status: nodeInfoStatus } = useNodeStatus(authToken);
  const { data: networksResponse, status } = useNetworksStatus(
    authToken !== undefined ? authToken : ''
  );

  const hasVersion = version !== undefined;
  const hasApi = apiStatusResponse === ApiStatus.success;
  const hasNoNetworks =
    status === 'success' &&
    networksResponse !== undefined &&
    networksResponse.data.length === 0;
  const showWelcome =
    !hasApi ||
    authToken === undefined ||
    nodeInfoStatus !== 'success' ||
    hasNoNetworks;

  return (
    <Wrap pt={{ base: 2, lg: 4 }} spacing={{ base: 4, lg: 8 }}>
      {showWelcome && (
        <WrapItem width="36em">
          <WelcomeInfoCard hasNodeInfo={nodeInfoStatus === 'success'} />
        </WrapItem>
      )}
      {!hasVersion && (
        <WrapItem width="36em">
          <BrowserRunInfoCard />
        </WrapItem>
      )}
      {hasVersion && !hasApi && (
        <WrapItem width="36em">
          <ApiInfoCard />
        </WrapItem>
      )}
      {hasVersion &&
        hasApi &&
        (authToken === undefined || nodeInfoStatus !== 'success') && (
          <WrapItem width="36em">
            <AuthInfoCard
              configDirPath={configDirPath}
              authToken={authToken}
              tokenStatus={authTokenStatus}
            />
          </WrapItem>
        )}
      <WrapItem width="24em">
        <NodeInfoCard authToken={authToken !== undefined ? authToken : ''} />
      </WrapItem>
    </Wrap>
  );
}

export default HomePage;
