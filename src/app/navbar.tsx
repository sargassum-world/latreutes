import React, { ReactNode } from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Spacer,
  Stack,
  Link,
  Button,
  IconButton,
  useDisclosure,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, SunIcon } from '@chakra-ui/icons';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  exact: boolean;
  onClick(): void;
}
const NavLink = ({ children, href, exact, onClick }: NavLinkProps) => (
  <Link
    px={2}
    py={2}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.400', 'gray.800'),
    }}
    to={href}
    as={RouterNavLink}
    exact={exact}
    onClick={onClick}
  >
    {children}
  </Link>
);

interface MenuEntry {
  href: string;
  name: string;
  exact: boolean;
}
interface NavLinksProps {
  links: MenuEntry[];
  onClick(): void;
}
function NavLinks({ links, onClick }: NavLinksProps) {
  return (
    <>
      {links.map(({ href, name, exact }) => (
        <NavLink key={name} href={href} exact={exact} onClick={onClick}>
          {name}
        </NavLink>
      ))}
    </>
  );
}

interface Props {
  links: MenuEntry[];
}
function Navbar({ links }: Props): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { toggleColorMode } = useColorMode();

  return (
    <Box
      className="navbar"
      bg={useColorModeValue('gray.300', 'black')}
      px={4}
      py={{ lg: 4 }}
    >
      <Flex
        direction={{ base: 'row', lg: 'column' }}
        height={{ base: 16, lg: '100%' }}
        alignItems="center"
        justifyContent="space-between"
      >
        {links.length > 0 && (
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            display={{ sm: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
        )}
        <Stack
          direction={{ base: 'row', lg: 'column' }}
          as="nav"
          spacing={4}
          display={{ base: 'none', sm: 'flex' }}
        >
          <NavLinks links={links} onClick={onClose} />
        </Stack>
        <Spacer />
        <IconButton
          aria-label="Toggle theme color"
          icon={<SunIcon />}
          onClick={toggleColorMode}
        />
      </Flex>

      {isOpen && links.length > 0 ? (
        <Box pb={4} display={{ sm: 'none' }}>
          <Stack as="nav" spacing={4}>
            <NavLinks links={links} onClick={onClose} />
            <Button aria-label="Toggle theme color" onClick={toggleColorMode}>
              Toggle Theme Color
            </Button>
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}

export default Navbar;