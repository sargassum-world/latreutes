import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { Heading, Link, Text } from '@chakra-ui/react';

import { CenteredContainer } from '../../shared/layout';

function HomePage(): JSX.Element {
  return (
    <CenteredContainer>
      <Heading mb={6}>Welcome!</Heading>
      <Text>
        This is the home for this application! More content will be added soon.
      </Text>
      <Text>
        To join a network, or to view the networks this device has joined,
        please click on the&nbsp;
        <Link to="/networks" as={RouterNavLink} variant="colored">
          Networks
        </Link>
        &nbsp;button in the navigation bar.
      </Text>
    </CenteredContainer>
  );
}

export default HomePage;
