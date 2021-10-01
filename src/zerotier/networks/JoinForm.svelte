<script lang="ts" context="module">
  import { writable } from 'svelte/store';

  export const identifierTypes = {
    'domain-name': {
      name: 'domain name',
      label: 'Network Domain Name',
      placeholder: 'Domain name for the network',
    },
    'network-id': {
      name: 'ZeroTier network ID',
      label: 'ZeroTier Network ID',
      placeholder: 'ZeroTier network ID for the network',
    },
  };

  const { subscribe, set } = writable({
    identifierType: undefined,
    identifier: undefined,
  });
  export const submission = { subscribe };
</script>

<script lang="ts">
  import { createForm } from 'felte';
  import { svelteReporter, ValidationMessage } from '@felte/reporter-svelte';
  import isFQDN from 'validator/es/lib/isFQDN';

  import { hasDomainName } from '../../shared/dns';
  import { slide } from '../../shared/transitions';

  import { isNetworkId } from '../client/network';

  import NetworkId from './NetworkId.svelte';

  type IdentifierType = 'domain-name' | 'network-id';

  export let afterSubmit;

  let identifierType: IdentifierType = 'domain-name';

  $: label = identifierTypes[identifierType].label;
  $: placeholder = identifierTypes[identifierType].placeholder;

  const { form, data, touched, isValid } = createForm({
    extend: svelteReporter,
    validate: (values) => {
      const errors = {};
      if (values.identifierType === undefined) {
        errors.identifierType = ['Must select an identifier type!'];
        return errors;
      }

      const identifierError = `Must be a valid ${
        identifierTypes[values.identifierType].name
      }!`;
      if (!values.identifier) {
        errors.identifier = [identifierError];
        return errors;
      }

      switch (values.identifierType) {
        case 'domain-name': {
          if (!hasDomainName(values.identifier)) {
            errors.identifier = [identifierError];
            if (isNetworkId(values.identifier)) {
              errors.identifier = [
                ...errors.identifier,
                'If you meant to enter a ZeroTier network ID, you should select "Network ID" as the identifier type.',
              ];
            }
          }
          break;
        }
        case 'network-id': {
          if (!isNetworkId(values.identifier)) {
            errors.identifier = [
              identifierError,
              'A ZeroTier Network ID must consist of 16 characters, each of which should be a number from 0 to 9 or a letter from "a" to "f".',
            ];
            if (hasDomainName(values.identifier)) {
              errors.identifier = [
                ...errors.identifier,
                'If you meant to enter a domain name, you should select "Domain Name" as the identifier type.',
              ];
            }
          }
        }
      }
      return errors;
    },
    onSubmit: async (values) => {
      let identifier = '';
      switch (values.identifierType) {
        case 'domain-name': {
          try {
            identifier = new URL(values.identifier).hostname;
          } catch {
            identifier = values.identifier;
          }
          break;
        }
        default: {
          identifier = values.identifier;
        }
      }
      set(values);
      afterSubmit();
    },
  });

  function clearIdentifierTouched() {
    if ($data.identifier === '') {
      $touched.identifier = false;
    }
  }
</script>

<form use:form transition:slide|local>
  <p>
    You can join a network by providing the network's identifier as either a
    domain name (such as <span class="tag domain-name">prakashlab.dedyn.io</span
    >) or a ZeroTier network ID (such as <NetworkId id="1c33c1ced015c144" />).
  </p>
  <div class="field">
    <label class="label" for="identifierType">Identifier Type</label>
    <div class="control">
      <label class="radio">
        <input
          type="radio"
          name="identifierType"
          bind:group={identifierType}
          on:click={clearIdentifierTouched}
          value="domain-name"
          checked
        />
        Domain Name
      </label>
      <label class="radio">
        <input
          type="radio"
          name="identifierType"
          bind:group={identifierType}
          on:click={clearIdentifierTouched}
          value="network-id"
        />
        Network ID
      </label>
    </div>
  </div>
  <div class="field">
    <label class="label" for="domain-name">{label}</label>
    <div class="control">
      <input type="text" class="input" name="identifier" {placeholder} />
    </div>
    <ValidationMessage for="identifier" let:messages>
      {#if messages}
        <div
          class="message is-danger"
          aria-live="polite"
          transition:slide|local
        >
          <div class="message-body">
            {#each messages as message}
              <p transition:slide|local>{message}</p>
            {/each}
          </div>
        </div>
      {/if}
    </ValidationMessage>
  </div>
  <div class="field">
    <div class="control">
      <input
        type="submit"
        class="button is-primary"
        value="Continue"
        disabled={!$isValid}
      />
    </div>
  </div>
</form>
