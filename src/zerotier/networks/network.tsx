import React from 'react';
import { useQueryClient } from 'react-query';
import {
  Box,
  Stack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  Tag,
  Heading,
  Text,
  Code,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

import {
  Card,
  CardHeader,
  CardToolbar,
  CardBody,
  CardFooter,
} from '../../shared/layout';
import { useTxtResolver } from '../../dns/lookup';

import { Route, NetworkStatus, useNetworkLeaver } from './service';
import DNS_ZT_NETWORK_KEY from './dns';

interface NetworkSplitId {
  hostNodeId: string;
  networkNumber: string;
}
export function splitNetworkId(networkId: string): NetworkSplitId {
  return {
    hostNodeId: networkId.slice(0, 10),
    networkNumber: networkId.slice(10),
  };
}

// Components

interface NetworkDetailsProps {
  network: NetworkStatus;
}
function NetworkName({ network }: NetworkDetailsProps) {
  const { hostNodeId, networkNumber } = splitNetworkId(network.id);
  const { data: txtRecords, status } = useTxtResolver(network.name);

  if (status === 'success' && txtRecords !== undefined) {
    const ztNetworkIdRecordPrefix = `${DNS_ZT_NETWORK_KEY}=`;
    const ztNetworkIdRecords = txtRecords.filter((record) =>
      record.startsWith(ztNetworkIdRecordPrefix)
    );
    if (ztNetworkIdRecords.length === 1) {
      const ztNetworkId = ztNetworkIdRecords[0].slice(
        ztNetworkIdRecordPrefix.length
      );
      if (ztNetworkId === network.id) {
        return (
          <Heading as="h3" size="md" mb={1}>
            {network.name}
          </Heading>
        );
      }
    }
  }

  return (
    <Heading as="h3" size="md">
      <Code colorScheme="blue" pr={0} size="md" mb={1} fontWeight={400}>
        {hostNodeId}
      </Code>
      <Code colorScheme="teal" pl={0} size="md" mb={1} fontWeight={400}>
        {networkNumber}
      </Code>
      {!!network.name && <> {network.name}</>}
    </Heading>
  );
}
function ToolbarBadges({ network }: NetworkDetailsProps) {
  return (
    <>
      {network.status === 'OK' && (
        <Tag colorScheme="green" variant="solid" size="md">
          Authorized
        </Tag>
      )}
      {network.status === 'REQUESTING_CONFIGURATION' && (
        <Tag colorScheme="green" variant="solid" size="md">
          Requesting Information
        </Tag>
      )}
      {network.status === 'ACCESS_DENIED' && (
        <Tag colorScheme="red" variant="solid" size="md">
          Access Denied
        </Tag>
      )}
      {network.status === 'NOT_FOUND' && (
        <Tag colorScheme="red" variant="solid" size="md">
          Not Found
        </Tag>
      )}
      {network.status === 'PORT_ERROR' && (
        <Tag colorScheme="red" variant="solid" size="md">
          Port Error {network.portError}
        </Tag>
      )}
      {network.type === 'PUBLIC' && (
        <>
          &nbsp;
          <Tag colorScheme="pink" variant="solid" size="md">
            Public
          </Tag>
        </>
      )}
      {network.bridge && (
        <>
          &nbsp;
          <Tag colorScheme="teal" variant="solid" size="md">
            Bridge
          </Tag>
        </>
      )}
    </>
  );
}
function BasicDetails({ network }: NetworkDetailsProps) {
  const { hostNodeId, networkNumber } = splitNetworkId(network.id);

  return (
    <>
      <Heading as="h4" size="sm">
        Declared Name
      </Heading>
      {network.name.length > 0 ? (
        <Code>{network.name}</Code>
      ) : (
        <Tag colorScheme="pink" variant="solid">
          {network.status === 'OK' ? 'None' : 'Unknown'}
        </Tag>
      )}
      <Heading as="h4" size="sm" mt={2}>
        ZeroTier Network ID
      </Heading>
      <Code colorScheme="blue" pr={0}>
        {hostNodeId}
      </Code>
      <Code colorScheme="teal" pl={0}>
        {networkNumber}
      </Code>
      <Heading as="h4" size="sm" mt={2}>
        Network-Assigned IP Addresses
      </Heading>
      {network.assignedAddresses.length > 0 ? (
        <Stack spacing={0}>
          {network.assignedAddresses.map((address: string) => (
            <Text>
              <Code colorScheme="purple">{address}</Code>
            </Text>
          ))}
        </Stack>
      ) : (
        <Tag colorScheme="pink" variant="solid">
          {network.status === 'OK' ? 'None' : 'Unknown'}
        </Tag>
      )}
    </>
  );
}
function AdvancedDetails({ network }: NetworkDetailsProps) {
  return (
    <>
      <Heading as="h4" size="sm" mt={2}>
        Network Managed Routes
      </Heading>
      {network.routes.length > 0 ? (
        <Stack spacing={0}>
          {network.routes.map((route: Route) => (
            <Text>
              <Code colorScheme="purple">{route.target}</Code>
              {route.via !== null ? (
                <>
                  {' via '}
                  <Code colorScheme="purple">{route.via}</Code>
                </>
              ) : (
                ' (local)'
              )}
            </Text>
          ))}
        </Stack>
      ) : (
        <Tag colorScheme="pink" variant="solid">
          {network.status === 'OK' ? 'None' : 'Unknown'}
        </Tag>
      )}
      <Heading as="h4" size="sm" mt={2}>
        Virtual Network Device
      </Heading>
      <Text>
        Name:&nbsp;
        {network.portDeviceName.length > 0 ? (
          <Code>{network.portDeviceName}</Code>
        ) : (
          <Tag colorScheme="pink" variant="solid">
            None
          </Tag>
        )}
      </Text>
      <Text>
        MAC Address:&nbsp;
        {network.mac.length > 0 ? (
          <Code>{network.mac}</Code>
        ) : (
          <Tag colorScheme="pink" variant="solid">
            None
          </Tag>
        )}
      </Text>
      <Text>MTU: {network.mtu}</Text>
      <Heading as="h4" size="sm" mt={2}>
        Network Configuration
      </Heading>
      <Text>
        Broadcast: {network.broadcastEnabled ? 'Enabled' : 'Disabled'}
      </Text>
      <Text>Revision ID: {network.netconfRevision}</Text>
    </>
  );
}

interface NetworkProps extends NetworkDetailsProps {
  authToken: string;
}
function Settings({ network, authToken }: NetworkProps) {
  const queryClient = useQueryClient();
  const networkLeaver = useNetworkLeaver(network.id, authToken, queryClient);

  return (
    <>
      <Button
        onClick={() => networkLeaver.mutate()}
        leftIcon={<CloseIcon />}
        size="sm"
        colorScheme="teal"
      >
        Disconnect From Network
      </Button>
    </>
  );
}
function Network({ network, authToken }: NetworkProps): JSX.Element {
  return (
    <Card width="100%">
      <CardHeader>
        <NetworkName network={network} />
      </CardHeader>
      <CardToolbar>
        <ToolbarBadges network={network} />
      </CardToolbar>
      <CardBody>
        <Accordion allowMultiple mt={-4} mb={-6} mx={-4}>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Basic Details
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <BasicDetails network={network} />
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Advanced Details
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <AdvancedDetails network={network} />
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Settings
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <Settings network={network} authToken={authToken} />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </CardBody>
      <CardFooter />
    </Card>
  );
}

export default Network;
