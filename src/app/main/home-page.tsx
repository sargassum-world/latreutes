import React from 'react';
import { Heading, Text } from '@chakra-ui/react';

import { CenteredContainer } from '../../shared/layout';

function HomePage(): JSX.Element {
  return (
    <CenteredContainer>
      <Heading mb={6}>Home!</Heading>
      <Text>This is the home page! More content will be added soon.</Text>
    </CenteredContainer>
  );
}

export default HomePage;
