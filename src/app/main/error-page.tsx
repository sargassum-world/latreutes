import React from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';

interface Props {
  error: string;
}
function ErrorPage({ error }: Props): JSX.Element {
  return (
    <Flex flexGrow={1} alignItems="center" justifyContent="center">
      <Flex direction="column" p={12}>
        <Heading mb={6}>Error!</Heading>
        <Text>{error}</Text>
      </Flex>
    </Flex>
  );
}

export default ErrorPage;
