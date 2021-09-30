<script lang="ts">
  import { fade } from 'svelte/transition';
  import { useQueryClient } from '@sveltestack/svelte-query';
  import { Accordion, AccordionItem } from 'svelte-accessible-accordion';
  import Icon from 'mdi-svelte';
  import { mdiChevronDown } from '@mdi/js';

  import { NetworkSummary, useNetworkSummaries } from '../client/networks';
  import { prefetchNetworkInfo, splitNetworkId } from '../client/network';

  import NetworkName from './NetworkName.svelte';
  import BasicDetails from './BasicDetails.svelte';
  import AdvancedDetails from './AdvancedDetails.svelte';
  import Settings from './Settings.svelte';

  export let id;
  export let name;
  export let status;
  export let type;
  export let bridge;
  export let portError;
  export let authToken;

  const statusTags = {
    OK: {
      label: ({}) => 'Authorized',
      type: 'success',
    },
    REQUESTING_CONFIGURATION: {
      label: ({}) => 'Requesting Information',
      type: 'info',
    },
    ACCESS_DENIED: {
      label: ({}) => 'Access Denied',
      type: 'danger',
    },
    NOT_FOUND: {
      label: ({}) => 'Not Found',
      type: 'danger',
    },
    PORT_ERROR: {
      label: ({ portError }) => `Port Error ${portError}`,
      type: 'danger',
    },
    CLIENT_TOO_OLD: {
      label: ({}) => 'Incompatible Version',
      type: 'danger',
    },
  };

  const queryClient = useQueryClient();

  let showBasicDetails;
  let showAdvancedDetails;
  let showSettings;

  $: statusTag = statusTags[status];
  $: networkSummariesRes = useNetworkSummaries(authToken);
  $: networkSummaries = $networkSummariesRes.data;
  $: prefetchNetworkInfo(id, authToken, queryClient);
</script>

<header class="panel-heading">
  <h2 class="network-name"><NetworkName {id} {name} /></h2>
  <div class="tags">
    <span class={`tag is-${statusTag.type}`}
      >{statusTag.label({ portError })}</span
    >
    <!--TODO: add a tag if the network is self-hosted, by comparing the network ID's address section with the node ID-->
    {#if type === 'PUBLIC'}
      <span class="tag is-warning">Public</span>
    {/if}
    {#if bridge}
      <span class="tag is-info">Bridge</span>
    {/if}
  </div>
</header>
<Accordion multiselect>
  <AccordionItem bind:expanded={showBasicDetails} class="panel-block">
    <span slot="title" class="accordion-header level">
      <h3>Basic Details</h3>
      <span class="icon">
        <Icon path={mdiChevronDown} size="1em" />
      </span>
    </span>
    {#if showBasicDetails}
      <BasicDetails {id} {name} {authToken} />
    {/if}
  </AccordionItem>
  <AccordionItem bind:expanded={showAdvancedDetails} class="panel-block">
    <span slot="title" class="accordion-header level">
      <h3>Advanced Details</h3>
      <span class="icon">
        <Icon path={mdiChevronDown} size="1em" />
      </span>
    </span>
    {#if showAdvancedDetails}
      <AdvancedDetails {id} {authToken} {networkSummaries} />
    {/if}
  </AccordionItem>
  <AccordionItem bind:expanded={showSettings} class="panel-block">
    <span slot="title" class="accordion-header level">
      <h3>Settings</h3>
      <span class="icon">
        <Icon path={mdiChevronDown} size="1em" />
      </span>
    </span>
    {#if showSettings}
      <Settings {id} {status} {authToken} />
    {/if}
  </AccordionItem>
</Accordion>

<style>
  .panel-heading .tag {
    font-weight: normal;
  }
  .network-name {
    font-weight: normal;
    margin-bottom: 0.25em;
    display: inline-flex;
  }
</style>
