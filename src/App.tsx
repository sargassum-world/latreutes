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
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource/oxygen-mono/400.css';

import { useConfigPath, useAuthToken } from './shared/config';
import { ContentContainer, CenteredContainer } from './shared/layout';

import NetworksPage from './zerotier/networks';
import PeersPage from './zerotier/peers';

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
          <CenteredContainer>
            <HomePage
              configDirPath={configDirPath}
              authToken={authToken}
              authTokenStatus={authTokenStatus}
            />
          </CenteredContainer>
        </ContentContainer>
      </Route>
      <Route exact path="/networks">
        <AuthenticatedPage Component={NetworksPage} authToken={authToken} />
      </Route>
      <Route exact path="/peers">
        <AuthenticatedPage Component={PeersPage} pad authToken={authToken} />
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
  const authenticatedMenuItems = [
    { name: 'Networks', href: '/networks', exact: false },
    { name: 'Peers', href: '/peers', exact: false },
  ];
  const menuItems = authTokenMissing
    ? baseMenuItems
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
  fonts: {
    heading: 'Atkinson Hyperlegible',
    body: 'Atkinson Hyperlegible',
    mono: 'Oxygen Mono',
  },
  colors: { black: '#12141c' },
  initialColorMode: 'light',
  useSystemColorMode: true,
  components: {
    Link: {
      variants: {
        colored: {
          color: 'teal',
        },
      },
    },
    Code: {
      sizes: {
        xs: {
          fontSize: 'xs',
        },
        sm: {
          fontSize: 'sm',
        },
        md: {
          fontSize: 'md',
        },
        lg: {
          fontSize: 'lg',
        },
        xl: {
          fontSize: 'xl',
        },
        '2xl': {
          fontSize: '2xl',
        },
        '3xl': {
          fontSize: '3xl',
        },
        '4xl': {
          fontSize: '4xl',
        },
        '5xl': {
          fontSize: '5xl',
        },
        '6xl': {
          fontSize: '6xl',
        },
        '7xl': {
          fontSize: '7xl',
        },
        '8xl': {
          fontSize: '8xl',
        },
        '9xl': {
          fontSize: '9xl',
        },
      },
    },
  },
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
