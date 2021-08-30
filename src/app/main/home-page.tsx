import React from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';

function HomePage(): JSX.Element {
  return (
    <Flex flexGrow={1} alignItems="center" justifyContent="center">
      <Flex direction="column" p={12}>
        <Heading mb={6}>Home!</Heading>
        <Text>This is the home page! More content will be added soon.</Text>
      </Flex>
    </Flex>
  );
}

export default HomePage;
