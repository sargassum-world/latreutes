import React from 'react';
import { useQueryClient } from 'react-query';
import { isMacOS, isWindows } from '@tauri-apps/api/helpers/os-check';
import { Button, Heading, Text, Code } from '@chakra-ui/react';

import { AUTHTOKEN_FILENAME } from '../shared/config';

import { InfoCard } from '../shared/layout';

import { invalidateCache } from './service';

// Components

interface StatusMessageProps {
  configDirPath: string | undefined;
  tokenStatus: string;
}

function StatusMessage({ configDirPath, tokenStatus }: StatusMessageProps) {
  // TODO: display instructions if the directory is missing (i.e. ZeroTier was not installed)
  // or if the directory exists but the authtoken is missing (i.e. a new authtoken must provisioned)
  // TODO: confirm whether the path is correct by checking whether the file exists at that path
  // (this also allows checking if the path is actually at the BSD path)
  let ztAuthTokenPath = '/var/lib/zerotier-one/authtoken.secret';
  if (isMacOS()) {
    ztAuthTokenPath =
      '/Library/Application Support/ZeroTier/One/authtoken.secret';
  } else if (isWindows()) {
    ztAuthTokenPath = '\\ProgramData\\ZeroTier\\One\\authtoken.secret';
  }

  if (configDirPath === undefined) {
    return (
      <>
        <Text>
          Unable to determine where the <Code>authtoken.secret</Code> file
          should be found! Are you trying to run this program in a web browser?
          If so, you should launch the desktop application instead.
        </Text>
        <Text>
          If you are running this program in development mode, the desktop
          application window should launch soon.
        </Text>
      </>
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
      return <Text>Loaded auth token.</Text>;
    case 'error':
      return (
        <>
          <Text>
            This program could not find the <Code>authtoken.secret</Code> file!
            That file is needed for this program to interact with the ZeroTier
            program.
          </Text>
          <Text>
            You should be able to find the file at{' '}
            <Code>{ztAuthTokenPath}</Code>.
          </Text>
          <Text>
            Please copy it to <Code>{tokenPath}</Code>.
          </Text>
          <Text>
            You will need administrator permissions on this device in order to
            copy the file.
          </Text>
        </>
      );
    default:
      return <></>;
  }
}

interface Props {
  configDirPath: string | undefined;
  tokenStatus: string;
}
function AuthInfoCard({ configDirPath, tokenStatus }: Props): JSX.Element {
  const queryClient = useQueryClient();

  return (
    <InfoCard width="100%">
      <Heading as="h2" size="lg">
        ZeroTier Auth Token File Error
      </Heading>
      <StatusMessage configDirPath={configDirPath} tokenStatus={tokenStatus} />
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

export default AuthInfoCard;
