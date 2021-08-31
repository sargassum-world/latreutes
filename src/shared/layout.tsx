import React, { ReactNode } from 'react';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';

interface ContainerProps {
  children: ReactNode;
}
export function SubmenuContainer({ children }: ContainerProps): JSX.Element {
  return (
    <Box
      px={{ base: 4, lg: 8 }}
      py={4}
      width="100%"
      bg={useColorModeValue('gray.100', 'gray.900')}
    >
      {children}
    </Box>
  );
}
export function CenteredContainer({ children }: ContainerProps): JSX.Element {
  return (
    <Flex flexGrow={1} alignItems="center" justifyContent="center">
      <Flex direction="column">{children}</Flex>
    </Flex>
  );
}

interface ContentContainerProps extends ContainerProps {
  pad?: boolean;
}
export function ContentContainer({
  pad,
  children,
}: ContentContainerProps): JSX.Element {
  let padding = {};
  if (pad) {
    padding = { base: 4, lg: 8 };
  }
  return (
    <Flex flexGrow={1} p={padding} direction="column" overflow="auto">
      {children}
    </Flex>
  );
}
ContentContainer.defaultProps = {
  pad: false,
};
