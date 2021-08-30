import React, { ReactNode, useState, useEffect } from 'react';
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

import Auth from './zerotier/auth';
import Node from './zerotier/node';
import Networks from './zerotier/networks';
import Peers from './zerotier/peers';

import { LogicalSize, useWindowMinSizeSetter } from './app/window';
import Navbar from './app/navbar';
import HomePage from './app/main/home-page';
import LandingPage from './app/main/landing-page';
import ErrorPage from './app/main/error-page';

interface MainContainerProps {
  children: ReactNode;
}
function MainContainer({ children }: MainContainerProps) {
  return (
    <Flex
      flexGrow={1}
      p={{ base: 4, lg: 8 }}
      direction="column"
      overflow="auto"
    >
      {children}
    </Flex>
  );
}

interface AuthenticatedPageProps {
  Component: ({ authToken }: { authToken: string }) => JSX.Element;
  authToken: string | undefined;
}
function AuthenticatedPage({ Component, authToken }: AuthenticatedPageProps) {
  if (authToken === undefined) {
    return (
      <MainContainer>
        <ErrorPage error="Missing auth token!" />
      </MainContainer>
    );
  }

  return <Component authToken={authToken} />;
}

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
    <MainContainer>
      <Switch>
        <Route exact path="/">
          <MainContainer>
            <HomePage />
          </MainContainer>
        </Route>
        <Route path="/auth">
          <Auth configDirPath={configDirPath} tokenStatus={authTokenStatus} />
        </Route>
        <Route path="/node">
          <AuthenticatedPage Component={Node} authToken={authToken} />
        </Route>
        <Route path="/networks">
          <AuthenticatedPage Component={Networks} authToken={authToken} />
        </Route>
        <Route path="/peers">
          <AuthenticatedPage Component={Peers} authToken={authToken} />
        </Route>
      </Switch>
    </MainContainer>
  );
}

function WindowSizer() {
  const windowMinSizeSetter = useWindowMinSizeSetter();

  useEffect(() => {
    windowMinSizeSetter.mutate(new LogicalSize(500, 500));
    // We only want the window sizing to run exactly once when the component mounts,
    // or else it runs in an infinite loop. So we have to remove the dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
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
        <WindowSizer />
        <Navbar links={[]} />
        <MainContainer>
          <LandingPage />
        </MainContainer>
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
      <WindowSizer />
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
  styles: {
    global: (props: { colorMode: string; theme: string }) => ({
      'div.navbar': {
        'a.active': {
          backgroundColor: mode('gray.300', 'gray.600')(props),
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
