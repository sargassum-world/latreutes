import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import {
  ChakraProvider,
  Flex,
  IconButton,
  extendTheme,
} from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { CloseIcon } from '@chakra-ui/icons';

import { useConfigPath, useAuthToken } from './shared/config';
import { ContentContainer } from './shared/layout';

import Auth from './zerotier/auth';
import Node from './zerotier/node';
import Networks from './zerotier/networks';
import Peers from './zerotier/peers';

import Navbar from './app/navbar';
import HomePage from './app/main/home-page';
import LandingPage from './app/main/landing-page';
import ErrorPage from './app/main/error-page';

interface AuthenticatedPageProps {
  Component: ({ authToken }: { authToken: string }) => JSX.Element;
  pad?: boolean;
  authToken: string | undefined;
}
function AuthenticatedPage({
  Component,
  pad,
  authToken,
}: AuthenticatedPageProps) {
  if (authToken === undefined) {
    return (
      <ContentContainer pad>
        <ErrorPage error="Missing auth token!" />
      </ContentContainer>
    );
  }

  return (
    <ContentContainer pad={pad}>
      <Component authToken={authToken} />
    </ContentContainer>
  );
}
AuthenticatedPage.defaultProps = {
  pad: false,
};

interface MainContentProps {
  configDirPath: string | undefined;
  authToken: string | undefined;
  authTokenStatus: string;
}
function MainContent({
  configDirPath,
  authToken,
  authTokenStatus,
}: MainContentProps) {
  return (
    <Switch>
      <Route exact path="/">
        <ContentContainer pad>
          <HomePage />
        </ContentContainer>
      </Route>
      <Route path="/auth">
        <ContentContainer>
          <Auth configDirPath={configDirPath} tokenStatus={authTokenStatus} />
        </ContentContainer>
      </Route>
      <Route path="/node">
        <AuthenticatedPage Component={Node} pad authToken={authToken} />
      </Route>
      <Route path="/networks">
        <AuthenticatedPage Component={Networks} authToken={authToken} />
      </Route>
      <Route path="/peers">
        <AuthenticatedPage Component={Peers} pad authToken={authToken} />
      </Route>
    </Switch>
  );
}

function MainWindow() {
  const { data: configDirPath } = useConfigPath();
  const { data: authToken, status: authTokenStatus } =
    useAuthToken(configDirPath);
  const [showLanding, setShowLanding] = useState(true);
  const authTokenMissing =
    authTokenStatus === 'error' || authToken === undefined;

  if (showLanding && authTokenMissing) {
    return (
      <Flex direction={{ base: 'column', lg: 'row' }} height="100vh">
        <Navbar links={[]} />
        <ContentContainer pad>
          <LandingPage />
        </ContentContainer>
        <Flex alignItems="center" justifyContent="center">
          <Flex direction="column" p={12}>
            <IconButton
              onClick={() => setShowLanding(false)}
              aria-label="Dismiss"
              icon={<CloseIcon />}
            />
          </Flex>
        </Flex>
      </Flex>
    );
  }

  const baseMenuItems = [{ name: 'Home', href: '/', exact: true }];
  const unauthenticatedMenuItems = [
    { name: 'Auth', href: '/auth', exact: false },
  ];
  const authenticatedMenuItems = [
    { name: 'Info', href: '/node', exact: false },
    { name: 'Networks', href: '/networks', exact: false },
    { name: 'Peers', href: '/peers', exact: false },
  ];
  const menuItems = authTokenMissing
    ? [...baseMenuItems, ...unauthenticatedMenuItems]
    : [...baseMenuItems, ...authenticatedMenuItems];

  return (
    <Flex direction={{ base: 'column', lg: 'row' }} height="100vh">
      <Navbar links={menuItems} />
      <MainContent
        configDirPath={configDirPath}
        authToken={authToken}
        authTokenStatus={authTokenStatus}
      />
    </Flex>
  );
}

const theme = extendTheme({
  colors: { black: '#12141c' },
  styles: {
    global: (props: { colorMode: string; theme: string }) => ({
      'div.navbar': {
        'a.active': {
          backgroundColor: mode('gray.400', 'gray.800')(props),
        },
      },
    }),
  },
});

function App(): JSX.Element {
  return (
    <ChakraProvider theme={theme}>
      <MainWindow />
    </ChakraProvider>
  );
}

export default App;
