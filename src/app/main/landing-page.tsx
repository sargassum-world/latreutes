import React from 'react';
import { Heading, Text } from '@chakra-ui/react';

import { CenteredContainer } from '../../shared/layout';

function LandingPage(): JSX.Element {
  return (
    <CenteredContainer>
      <Heading mb={6}>Welcome!</Heading>
      <Text>
        This probably your first time using Latreutes on this computer. To
        start, please copy your ZeroTier authtoken.secret file.
      </Text>
    </CenteredContainer>
  );
}

export default LandingPage;
