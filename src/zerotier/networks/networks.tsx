import React from 'react';
import {
  Box,
  Flex,
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
  Heading,
  Text,
  Code,
  useDisclosure,
} from '@chakra-ui/react';

import { SubmenuContainer, ContentContainer } from '../../shared/layout';

import { ErrorRenderer } from '../service';

import { NetworkStatus, useNetworksStatus } from './service';
import JoinerForm from './joining';
import Network, { NetworkId } from './network';

// Components

interface Props {
  authToken: string;
}
function NetworksList({ authToken }: Props): JSX.Element {
  const {
    data: networksResponse,
    status,
    error,
  } = useNetworksStatus(authToken);

  const renderedError = ErrorRenderer(status, error);
  if (renderedError !== undefined) {
    return (
      <ContentContainer pad>
        <Heading as="h1" size="xl" pt={4}>
          Networks
        </Heading>
        {renderedError}
      </ContentContainer>
    );
  }

  if (networksResponse === undefined) {
    return (
      <ContentContainer pad>
        <Heading as="h1" size="xl" pt={4}>
          Networks
        </Heading>
        <Text>Error: response is undefined even though request succeeded.</Text>
      </ContentContainer>
    );
  }

  const networks = networksResponse.data;
  const hasAnyNetworks = networks.length > 0;
  const authorizedNetworks = networks.filter(
    (network: NetworkStatus) => network.status === 'OK'
  );
  const hasAuthorizedNetworks = authorizedNetworks.length > 0;
  const hasDisconnectedNetworks = false;
  const unauthorizedNetworks = networks.filter(
    (network: NetworkStatus) => network.status !== 'OK'
  );
  const hasUnauthorizedNetworks = unauthorizedNetworks.length > 0;

  return (
    <ContentContainer pad>
      {!hasAnyNetworks && (
        <>
          <Heading mb={6} size="xl" pt={4}>
            Welcome!
          </Heading>
          <Text>
            This device is not yet aware of any networks! You can try to join a
            network by pressing the &quot;Join a Network&quot; button above, or
            you can host your own network by pressing the &quot;Host a
            Network&quot; button above.
          </Text>
        </>
      )}
      {hasAuthorizedNetworks && (
        <Box>
          <Heading as="h2" size="xl" py={4}>
            Authorized Networks
          </Heading>
          <Text mb={4}>
            This device is authorized by the following networks to connect as a
            peer, and it is configured to connect to them:
          </Text>
          <Wrap spacing={8}>
            {authorizedNetworks.map((network: NetworkStatus) => (
              <WrapItem width="26em">
                <Network network={network} authToken={authToken} />
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}
      {hasDisconnectedNetworks && (
        <Box>
          <Heading as="h2" size="xl" py={4}>
            Disconnected Networks
          </Heading>
          <Text mb={4}>
            This device was connected (or had tried to connect) to the following
            networks, but either you or someone else on this device disconnected
            this device from the network; the information displayed below may be
            out-of-date:
          </Text>
        </Box>
      )}
      {hasUnauthorizedNetworks && (
        <Box>
          <Heading as="h2" size="xl" py={4}>
            Unauthorized Networks
          </Heading>
          <Text mb={4}>
            This device is trying to connect as a peer on the following
            networks, but the network, if it exists, is not allowing the device
            to connect:
          </Text>
          <Wrap spacing={8}>
            {unauthorizedNetworks.map((network: NetworkStatus) => (
              <WrapItem width="26em">
                <Network network={network} authToken={authToken} />
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}
    </ContentContainer>
  );
}
export function Networks({ authToken }: Props): JSX.Element {
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
              <Code variant="solid">prakashlab.dedyn.io</Code>) or a ZeroTier
              network ID (such as&nbsp;
              <NetworkId networkId="1c33c1ced015c144" />
              ).
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
