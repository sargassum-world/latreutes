import React from 'react';
import { Heading, Text } from '@chakra-ui/react';

import { CenteredContainer } from '../../shared/layout';

interface Props {
  error: string;
}
function ErrorPage({ error }: Props): JSX.Element {
  return (
    <CenteredContainer>
      <Heading mb={6}>Error!</Heading>
      <Text>{error}</Text>
    </CenteredContainer>
  );
}

export default ErrorPage;
