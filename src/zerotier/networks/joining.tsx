import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import { Formik, Form, Field, FieldProps } from 'formik';
import isFQDN from 'validator/es/lib/isFQDN';
import {
  Box,
  Stack,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Radio,
  RadioGroup,
  Input,
  Text,
  Code,
} from '@chakra-ui/react';

import { useTxtResolver } from '../../shared/dns';

import { QUERY_REFETCH, useNetworkStatus, useNetworkJoiner } from './service';
import { NetworkId } from './network';
import DNS_ZT_NETWORK_KEY from './dns';

// Components

interface NetworkIdJoinerProps {
  networkId: string;
  authToken: string;
}
function NetworkIdJoiner({ networkId, authToken }: NetworkIdJoinerProps) {
  const queryClient = useQueryClient();
  const networkJoiner = useNetworkJoiner(authToken, queryClient);
  const [joined, setJoined] = useState(false);
  const { data: networkResponse, isLoading } = useNetworkStatus(
    networkId,
    authToken,
    QUERY_REFETCH * 1000,
    QUERY_REFETCH * 1000
  );

  if (!networkId || isLoading) {
    return <></>;
  }

  // Note: if NetworkIdJoiner is merely redrawn when the props change, rather than
  // being destroyed and created again, then joined will not reset, even though
  // we want it to reset!
  if (joined) {
    return (
      <>
        <Text>
          Attempted to join <NetworkId networkId={networkId} />!
        </Text>
        <Text>
          For security reasons, when you try to join a network you&apos;ll
          usually have to be authorized by the network&apos;s host before you
          can actually access the network.
        </Text>
      </>
    );
  }

  if (networkResponse !== undefined) {
    const network = networkResponse.data;
    if (network.id === networkId) {
      return (
        <Text>
          This device has already joined the network with ZeroTier network ID{' '}
          <NetworkId networkId={networkId} />.
        </Text>
      );
    }
  }

  networkJoiner.mutate(networkId);
  setJoined(true);
  return (
    <Text>
      Joining <NetworkId networkId={networkId} />
      ...
    </Text>
  );
}

interface DomainNameJoinerProps {
  domainName: string;
  authToken: string;
}
function DomainNameJoiner({ domainName, authToken }: DomainNameJoinerProps) {
  const { data: txtRecords, status } = useTxtResolver(domainName);

  if (!domainName) {
    return <></>;
  }

  switch (status) {
    case 'idle':
    case 'loading':
      return <Text>Loading...</Text>;
    case 'error':
      return (
        <Text>
          Error: Could not find any records at the provided domain name.
          <br />
          Did you enter a valid domain name? Are you connected to the internet,
          or at least to the server which stores the records for the domain
          name?
        </Text>
      );
    default:
      if (txtRecords === undefined) {
        return <Text>Error: unknown</Text>;
      }
  }

  const ztNetworkIdRecordPrefix = `${DNS_ZT_NETWORK_KEY}=`;
  const ztNetworkIdRecords = txtRecords.filter((record) =>
    record.startsWith(ztNetworkIdRecordPrefix)
  );
  if (ztNetworkIdRecords.length === 0) {
    return (
      <Text>
        Error: could not find any ZeroTier Network IDs published at the domain
        name!
        <br />
        Did you enter a valid domain name?
      </Text>
    );
  }
  if (ztNetworkIdRecords.length > 1) {
    return (
      <Text>
        Error: multiple ZeroTier Network IDs are published at the domain name!
      </Text>
    );
  }
  const ztNetworkId = ztNetworkIdRecords[0].slice(
    ztNetworkIdRecordPrefix.length
  );
  if (ztNetworkId.length === 0) {
    return (
      <Text>
        Error: the ZeroTier Network ID published at the domain name is empty!
        Did the operator of the domain name incorrectly configure their public
        records?
      </Text>
    );
  }

  return (
    <>
      <Text>
        The network at <Code>{domainName}</Code> has ZeroTier network ID{' '}
        <NetworkId networkId={ztNetworkId} />.
      </Text>
      <NetworkIdJoiner networkId={ztNetworkId} authToken={authToken} />
    </>
  );
}

enum IdentifierType {
  domainName = 'domainName',
  networkId = 'networkId',
}
interface GenericJoinerProps {
  identifierType: IdentifierType;
  identifier: string;
  authToken: string;
  submitted: boolean;
  setSubmitted: (submitted: boolean) => void;
  onClose(): void;
}
function Joiner({
  identifierType,
  identifier,
  authToken,
  submitted,
  setSubmitted,
  onClose,
}: GenericJoinerProps) {
  if (!identifier || !submitted) {
    return <></>;
  }

  return (
    <>
      {identifierType === IdentifierType.domainName && (
        <DomainNameJoiner domainName={identifier} authToken={authToken} />
      )}
      {identifierType === IdentifierType.networkId && (
        <NetworkIdJoiner networkId={identifier} authToken={authToken} />
      )}
      <ButtonGroup colorScheme="teal" mt={8}>
        <Button
          onClick={() => {
            setSubmitted(false);
          }}
        >
          Join Another Network
        </Button>
        <Button onClick={onClose}>Close</Button>
      </ButtonGroup>
    </>
  );
}

interface IdentifierTypeSelectorProps {
  type: IdentifierType;
  setType: (type: IdentifierType) => void;
}
function IdentifierTypeSelector({
  type,
  setType,
}: IdentifierTypeSelectorProps) {
  return (
    <Field name="identifierType">
      {({ field, form }: FieldProps) => (
        <FormControl
          isInvalid={
            form.touched.identifierType && !!form.errors.identifierType
          }
        >
          <FormLabel htmlFor="identifierType">Identifier Type</FormLabel>
          <RadioGroup
            {...field}
            value={type}
            onChange={(value) => {
              switch (value) {
                case 'domainName':
                  setType(IdentifierType.domainName);
                  break;
                default:
                  setType(IdentifierType.networkId);
                  break;
              }
            }}
          >
            <Stack direction="row">
              <Radio value="domainName">Domain Name</Radio>
              <Radio value="networkId">Network ID</Radio>
            </Stack>
          </RadioGroup>
          <FormErrorMessage>{form.errors.identifierType}</FormErrorMessage>
        </FormControl>
      )}
    </Field>
  );
}

const identifierValidator =
  (identifierType: IdentifierType) => (identifier: string) => {
    const networkIdRegex = /^[a-z\d]{16}$/i;
    switch (identifierType) {
      case IdentifierType.domainName: {
        if (!identifier) {
          return 'Required';
        }

        let submittedDomainName = '';
        try {
          submittedDomainName = new URL(identifier).hostname;
        } catch {
          submittedDomainName = identifier;
        }

        if (
          isFQDN(submittedDomainName, {
            require_tld: false,
            allow_trailing_dot: true,
          })
        ) {
          return '';
        }

        return 'This looks like neither a valid domain name nor a valid URL';
      }
      case IdentifierType.networkId:
        if (!identifier) {
          return 'Required';
        }

        if (!networkIdRegex.test(identifier)) {
          return 'A ZeroTier Network ID must consist of 16 characters, each of which should be a number from 0 to 9 or a letter from "a" to "f"';
        }
        break;
      default:
        return 'Invalid identifier type!';
    }
    return '';
  };
interface IdentifierInputProps {
  type: IdentifierType;
}
function IdentifierInput({ type }: IdentifierInputProps) {
  let identifierTitle = 'Identifier';
  let identifierPlaceholder = 'Identifier for the network';
  switch (type) {
    case IdentifierType.domainName:
      identifierTitle = 'Network Domain Name';
      identifierPlaceholder = 'Domain name for the network';
      break;
    case IdentifierType.networkId:
      identifierTitle = 'ZeroTier Network ID';
      identifierPlaceholder = 'ZeroTier Network ID for the network';
      break;
    default:
      break;
  }

  return (
    <Field name="identifier" validate={identifierValidator(type)}>
      {({ field, form }: FieldProps) => (
        <FormControl
          isInvalid={form.touched.identifier && !!form.errors.identifier}
        >
          <FormLabel htmlFor="identifier">{identifierTitle}</FormLabel>
          <Input
            {...field}
            id="identifier"
            placeholder={identifierPlaceholder}
          />
          <FormErrorMessage>{form.errors.identifier}</FormErrorMessage>
        </FormControl>
      )}
    </Field>
  );
}

interface JoinerFormProps {
  onClose(): void;
  authToken: string;
}
function JoinerForm({ onClose, authToken }: JoinerFormProps): JSX.Element {
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState(
    IdentifierType.domainName
  );
  const [submitted, setSubmitted] = useState(false);

  return (
    <Stack>
      <Formik
        initialValues={{
          identifierType: IdentifierType.domainName,
          identifier: '',
        }}
        onSubmit={(values, actions) => {
          switch (values.identifierType) {
            case IdentifierType.domainName: {
              let submittedDomainName = '';
              try {
                submittedDomainName = new URL(values.identifier).hostname;
              } catch {
                submittedDomainName = values.identifier;
              }
              setIdentifier(submittedDomainName);
              break;
            }
            default: {
              setIdentifier(values.identifier);
              break;
            }
          }
          setSubmitted(true);
          actions.setSubmitting(false);
        }}
        validateOnChange={false}
      >
        <Box display={identifier && submitted ? 'none' : 'block'}>
          <Form>
            <Stack spacing={4}>
              <Text>
                You can join a network by providing the network&apos;s
                identifier as either a domain name or URL (such as{' '}
                <Code variant="solid">prakashlab.dedyn.io</Code>) or a ZeroTier
                network ID (such as <NetworkId networkId="1c33c1ced015c144" />
                ).
              </Text>
              <IdentifierTypeSelector
                type={identifierType}
                setType={setIdentifierType}
              />
              <IdentifierInput type={identifierType} />
              <Text>
                You should only join a network if its administrators are
                accountable to you in setting the network&apos;s security and
                membership policies to help keep your device secure, and if your
                own device has secure local firewall settings.
              </Text>
              <Box>
                <Button type="submit" colorScheme="teal">
                  Join
                </Button>
              </Box>
            </Stack>
          </Form>
        </Box>
      </Formik>
      <Joiner
        identifierType={identifierType}
        identifier={identifier}
        authToken={authToken}
        submitted={submitted}
        setSubmitted={setSubmitted}
        onClose={onClose}
      />
    </Stack>
  );
}

export default JoinerForm;
