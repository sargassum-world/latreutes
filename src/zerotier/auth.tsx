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

import {
  AUTHTOKEN_FILENAME,
  invalidateAuthTokenCache,
  useConfigDirMaker,
} from '../shared/config';
import { useShellOpener, useSuCopier } from '../shared/shell';

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
  const queryClient = useQueryClient();
  const { status: nodeStatus } = useNodeStatus(authToken);

  const configDirMaker = useConfigDirMaker();
  let ztOneConfigPath = '/var/lib/zerotier-one/';
  let os = 'linux';
  if (isMacOS()) {
    ztOneConfigPath = '/Library/Application Support/ZeroTier/One/';
    os = 'macOS';
  } else if (isWindows()) {
    ztOneConfigPath = '\\ProgramData\\ZeroTier\\One\\';
    os = 'windows';
  }
  const shellOpener = useShellOpener();
  const suCopier = useSuCopier(() => {
    invalidateAuthTokenCache(queryClient);
    invalidateCache(queryClient);
  });

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
              onClick={() => {
                configDirMaker.mutate();
                shellOpener.mutate(ztOneConfigPath);
              }}
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
          {os === 'linux' && (
            <Text>
              The easiest way to copy the file while ensuring that the copied
              file has the correct permission is to run the following command in
              the terminal:
              <br />
              <Code>
                sudo cat {ztOneConfigPath}authtoken.secret &gt; {configDirPath}
                authtoken.secret
              </Code>
              <br />
              You may be able to run that command simply by pressing this
              button:
              <br />
              <Button
                colorScheme="teal"
                onClick={() => {
                  suCopier.mutate({
                    source: `${ztOneConfigPath}authtoken.secret`,
                    dest: `${configDirPath}authtoken.secret`,
                  });
                }}
              >
                Copy ZeroTier file
              </Button>
            </Text>
          )}
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
