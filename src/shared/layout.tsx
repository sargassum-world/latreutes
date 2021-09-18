import React, { ReactNode } from 'react';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';

// Containers

interface ContainerProps {
  children: ReactNode;
}
interface OptionalContainerProps {
  children?: ReactNode;
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
  let paddingTop = {};
  if (pad) {
    padding = { base: 4, lg: 8 };
    paddingTop = { base: 2, lg: 4 };
  }
  return (
    <Flex
      flexGrow={1}
      px={padding}
      pt={paddingTop}
      pb={padding}
      direction="column"
      overflow="auto"
    >
      {children}
    </Flex>
  );
}
ContentContainer.defaultProps = {
  pad: false,
};

// Cards

interface CardProps extends ContainerProps {
  width?: string | number;
}
export function InfoCard({ children, width }: CardProps): JSX.Element {
  return (
    <Box
      background={useColorModeValue('gray.100', 'gray.900')}
      p={{ base: 4, sm: 8 }}
      width={width}
      overflow="auto"
    >
      {children}
    </Box>
  );
}
InfoCard.defaultProps = {
  width: undefined,
};
export function EntityCard({ children, width }: CardProps): JSX.Element {
  return (
    <Box
      background={useColorModeValue('gray.100', 'gray.900')}
      p={{ base: 4, sm: 8 }}
      rounded="xl"
      overflow="auto"
      width={width}
    >
      {children}
    </Box>
  );
}
EntityCard.defaultProps = {
  width: undefined,
};
export function CardHeader({ children }: ContainerProps): JSX.Element {
  return (
    <Box
      background={useColorModeValue('gray.300', 'gray.700')}
      mt={{ base: -4, sm: -8 }}
      mx={{ base: -4, sm: -8 }}
      pt={4}
      pb={2}
      px={4}
    >
      {children}
    </Box>
  );
}
export function CardToolbar({ children }: ContainerProps): JSX.Element {
  return (
    <Box
      background={useColorModeValue('gray.300', 'gray.700')}
      mx={{ base: -4, sm: -8 }}
      px={4}
      pb={4}
    >
      {children}
    </Box>
  );
}
export function CardBody({ children }: ContainerProps): JSX.Element {
  return (
    <Box mx={{ base: -4, sm: -8 }} pt={4} pb={2} px={4}>
      {children}
    </Box>
  );
}
export function CardFooter({ children }: OptionalContainerProps): JSX.Element {
  if (children === undefined) {
    return <Box mb={{ base: -4, sm: -8 }} mx={{ base: -4, sm: -8 }} p={4} />;
  }

  return (
    <Box mb={{ base: -4, sm: -8 }} mx={{ base: -4, sm: -8 }} p={4}>
      {children}
    </Box>
  );
}
CardFooter.defaultProps = {
  children: undefined,
};
