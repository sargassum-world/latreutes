import React from 'react';
import { useQueryClient } from 'react-query';
import { isMacOS, isWindows } from '@tauri-apps/api/helpers/os-check';
import { Button, Input, Text } from '@chakra-ui/react';

import { AUTHTOKEN_FILENAME } from '../shared/config';
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
      <Text>
        Unable to determine where the authtoken file should be stored!
        <br />
        Are you trying to run the application in a web browser?
        <br />
        If so, you should be launching the desktop application instead.
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
      return <Text>{`Loaded auth token from: ${tokenPath}`}</Text>;
    case 'error':
      return (
        <Text>
          {`authtoken not found. Please copy it from (probably) ${ztAuthTokenPath} to ${tokenPath}.`}
          <br />
          You will need administrator permissions to copy that file.
        </Text>
      );
    default:
      return <></>;
  }
}

interface TokenProps {
  token: string | undefined;
}
function Token({ token }: TokenProps) {
  return (
    <Text>
      Auth token:{' '}
      <Input
        name="authToken"
        type="text"
        value={token}
        placeholder="Loading..."
        readOnly
      />
    </Text>
  );
}

interface Props {
  configDirPath: string | undefined;
  token: string | undefined;
  tokenStatus: string;
}
function Auth({ configDirPath, token, tokenStatus }: Props): JSX.Element {
  const queryClient = useQueryClient();

  return (
    <>
      <Text>
        <Button
          onClick={() => {
            invalidateCache(queryClient);
          }}
        >
          Reload
        </Button>
      </Text>
      <StatusMessage configDirPath={configDirPath} tokenStatus={tokenStatus} />
      <Token token={token} />
    </>
  );
}

export default Auth;
