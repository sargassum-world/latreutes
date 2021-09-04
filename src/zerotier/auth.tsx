import React from 'react';
import { useQueryClient } from 'react-query';
import { isMacOS, isWindows } from '@tauri-apps/api/helpers/os-check';
import {
  Stack,
  Button,
  Heading,
  Text,
  Code,
  OrderedList,
  ListItem,
} from '@chakra-ui/react';

import { AUTHTOKEN_FILENAME, invalidateAuthTokenCache } from '../shared/config';
import useShellOpener from '../shared/shell';

import { InfoCard } from '../shared/layout';

import { SERVICE_PORT_ZT, invalidateCache } from './service';
import { useNodeStatus } from './node';

// Components

interface StatusMessageProps {
  configDirPath: string | undefined;
  authToken: string | undefined;
  tokenStatus: string;
}

function StatusMessage({
  configDirPath,
  authToken,
  tokenStatus,
}: StatusMessageProps) {
  const { status: nodeStatus } = useNodeStatus(authToken);

  let ztOneConfigPath = '/var/lib/zerotier-one/';
  if (isMacOS()) {
    ztOneConfigPath = '/Library/Application Support/ZeroTier/One/';
  } else if (isWindows()) {
    ztOneConfigPath = '\\ProgramData\\ZeroTier\\One\\';
  }
  const shellOpener = useShellOpener();

  if (configDirPath === undefined) {
    return (
      <Text>
        This program is unable to determine where the{' '}
        <Code>authtoken.secret</Code> file should be found! This error is not
        supposed to happen.
      </Text>
    );
  }

  const tokenPath = `${configDirPath}${AUTHTOKEN_FILENAME}`;

  switch (tokenStatus) {
    case 'loading':
      if (tokenPath) {
        return <Text>{`Loading auth token from: ${tokenPath}`}</Text>;
      }
      return <Text>Loading auth token...</Text>;
    case 'success':
      if (nodeStatus === 'success') {
        return (
          <Stack spacing={2}>
            <Text>Loaded auth token.</Text>
          </Stack>
        );
      }
      // TODO: try removing the last char from the authtoken; if it works, just
      // use that.

      return (
        <Stack spacing={2}>
          <Text>
            In order for this program to work, your computer needs to talk to
            the ZeroTier service on port {SERVICE_PORT_ZT}, which should be
            secured by the auth token in the <Code>authtoken.secret</Code> file.
            This program was able to open a copy of{' '}
            <Code>authtoken.secret</Code> in
            <br />
            <Code>{configDirPath}</Code>
            <br />
            but port {SERVICE_PORT_ZT} didn&apos;t respond as expected with the
            ZeroTier auth token. There are two likely reasons for this:
            <OrderedList>
              <ListItem>
                The copy of <Code>authtoken.secret</Code> at
                <Code>{configDirPath}</Code>
                is different from the copy the ZeroTier service has.
              </ListItem>
              <ListItem>
                The ZeroTier service is not running on port {SERVICE_PORT_ZT},
                and instead some other program is running on it.
              </ListItem>
            </OrderedList>
          </Text>
        </Stack>
      );
    case 'error':
      return (
        <Stack spacing={2}>
          <Text>
            In order for this program to talk to the ZeroTier service running on
            your computer, you&apos;ll need to make a copy of ZeroTier&apos;s{' '}
            <Code>authtoken.secret</Code> file so that this program can access
            the copy. You&apos;ll need administrator permissions on this device
            in order to open or copy the file.
          </Text>
          <Text>
            You can probably find the file at:
            <br />
            <Button
              variant="ghost"
              p={0}
              fontWeight={400}
              userSelect="auto"
              onClick={() => shellOpener.mutate(ztOneConfigPath)}
            >
              <Code>{ztOneConfigPath}authtoken.secret</Code>
            </Button>
          </Text>
          <Text>
            Please copy it into:
            <br />
            <Button
              variant="ghost"
              p={0}
              fontWeight={400}
              userSelect="auto"
              onClick={() => shellOpener.mutate(configDirPath)}
            >
              <Code>{configDirPath}</Code>
            </Button>
            <br />
            and make sure you can open the copied file with a text editor.
          </Text>
          <Text>
            Note that anyone who can open the <Code>authtoken.secret</Code> file
            will be able to join, leave, create, and delete ZeroTier networks on
            your device, either by directly running ZeroTier commands or by
            running this program.
          </Text>
        </Stack>
      );
    default:
      return <></>;
  }
}

interface Props {
  configDirPath: string | undefined;
  authToken: string | undefined;
  tokenStatus: string;
}
function AuthInfoCard({
  configDirPath,
  authToken,
  tokenStatus,
}: Props): JSX.Element {
  const queryClient = useQueryClient();

  return (
    <InfoCard width="100%">
      <Heading as="h2" size="lg">
        Set Up the ZeroTier Auth Token
      </Heading>
      <StatusMessage
        configDirPath={configDirPath}
        authToken={authToken}
        tokenStatus={tokenStatus}
      />
      <Text>
        <Button
          onClick={() => {
            invalidateAuthTokenCache(queryClient);
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

export default AuthInfoCard;
