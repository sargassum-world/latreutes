import React from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';

function LandingPage(): JSX.Element {
  return (
    <Flex flexGrow={1} alignItems="center" justifyContent="center">
      <Flex direction="column" p={12}>
        <Heading mb={6}>Welcome!</Heading>
        <Text>
          This probably your first time using Latreutes on this computer. To
          start, please copy your ZeroTier authtoken.secret file.
        </Text>
      </Flex>
    </Flex>
  );
}

export default LandingPage;
