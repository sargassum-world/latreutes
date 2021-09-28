<script lang="ts">
  import { fade } from 'svelte/transition';
  import { Accordion, AccordionItem } from 'svelte-accessible-accordion';
  import Icon from 'mdi-svelte';
  import { mdiChevronDown } from '@mdi/js';

  import { NetworkSummary, useNetworkSummaries } from '../client/networks';
  import { splitNetworkId } from '../client/network';

  import PeerDetails from './PeerDetails.svelte';
  import PathsDetails from './PathsDetails.svelte';

  export let address;
  export let role;
  export let authToken;

  let showDetails;
  let showPaths;

  $: casedRole = role.charAt(0) + role.slice(1).toLowerCase();
  $: networkSummariesRes = useNetworkSummaries(authToken);
  $: networkSummaries = $networkSummariesRes.data;
  $: networkHosts = networkSummaries?.map(
    (network: NetworkSummary) => splitNetworkId(network.id).hostAddress,
  );
  $: isNetworkHost =
    $networkSummariesRes.status === 'success' &&
    networkHosts !== undefined &&
    networkHosts.includes(address);
</script>

<header class="panel-heading">
  <h2 class="tag zerotier-address">{address}</h2>
  <div class="tags">
    <span class="tag is-success">{casedRole}</span>
    {#if isNetworkHost}
      <span class="tag is-success" transition:fade|local>Network Host</span>
    {/if}
  </div>
</header>
<Accordion multiselect>
  <AccordionItem bind:expanded={showDetails} class="panel-block">
    <span slot="title" class="accordion-header level">
      <h3>Details</h3>
      <span class="icon">
        <Icon path={mdiChevronDown} size="1em" />
      </span>
    </span>
    {#if showDetails}
      <PeerDetails {address} {authToken} {networkSummaries} />
    {/if}
  </AccordionItem>
  <AccordionItem bind:expanded={showPaths} class="panel-block">
    <span slot="title" class="accordion-header level">
      <h3>Active Physical Paths</h3>
      <span class="icon">
        <Icon path={mdiChevronDown} size="1em" />
      </span>
    </span>
    {#if showPaths}
      <PathsDetails {address} {authToken} />
    {/if}
  </AccordionItem>
</Accordion>

<style>
  .panel-heading .tag {
    font-weight: normal;
  }
  h2 {
    margin-left: -0.25em;
  }
</style>
