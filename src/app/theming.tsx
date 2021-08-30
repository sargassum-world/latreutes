import React from 'react';
import { Button, useColorMode } from '@chakra-ui/react';
import { SunIcon } from '@chakra-ui/icons';

function ColorToggle(): JSX.Element {
  const { toggleColorMode } = useColorMode();
  return (
    <Button onClick={toggleColorMode}>
      <SunIcon />
    </Button>
  );
}

export default ColorToggle;
