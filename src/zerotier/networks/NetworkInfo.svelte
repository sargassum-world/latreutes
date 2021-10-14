<script lang="ts">
  import { useQueryClient } from '@sveltestack/svelte-query';
  import { Accordion, AccordionItem } from 'svelte-accessible-accordion';
  import Icon from 'mdi-svelte';
  import { mdiChevronDown } from '@mdi/js';

  import { NetworkSummary, useNetworkSummaries } from '../client/networks';
  import { prefetchNetworkInfo, splitNetworkId } from '../client/network';

  import NetworkName from './NetworkName.svelte';
  import StatusTags from './StatusTags.svelte';
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

  const queryClient = useQueryClient();

  let showBasicDetails;
  let showAdvancedDetails;
  let showSettings;

  $: networkSummariesRes = useNetworkSummaries(authToken);
  $: networkSummaries = $networkSummariesRes.data;
  $: prefetchNetworkInfo(id, authToken, queryClient);
</script>

<header class="panel-heading">
  <h2 class="network-name"><NetworkName {id} {name} /></h2>
  <div class="tags">
    <StatusTags {status} {type} {bridge} {portError} />
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
  .network-name {
    font-weight: normal;
    margin-bottom: 0.25em;
    display: inline-flex;
  }
</style>
