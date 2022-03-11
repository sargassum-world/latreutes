<script lang="ts">
  import { fade } from 'svelte/transition';
  import { useQueryClient } from '@sveltestack/svelte-query';
  import { Accordion, AccordionItem } from 'svelte-accessible-accordion';
  import Icon from 'mdi-svelte';
  import { mdiChevronDown } from '@mdi/js';

  import type { Role } from '../client/peer';
  import { prefetchPeerInfo } from '../client/peer';
  import type { NetworkSummary } from '../client/networks';
  import { useNetworkSummaries } from '../client/networks';
  import { splitNetworkId } from '../client/network';

  import PeerDetails from './PeerDetails.svelte';
  import PathsDetails from './PathsDetails.svelte';

  export let address: string;
  export let role: Role;
  export let authToken: string | undefined;

  const queryClient = useQueryClient();

  let showDetails: boolean;
  let showPaths: boolean;

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
  // We use void to ignore the result of the prefetch promise - it the prefetch fails, it's fine
  $: void prefetchPeerInfo(address, authToken, queryClient);
</script>

<header class="panel-heading">
  <h2 class="entity-name">
    <span class="tag zerotier-address">{address}</span>
  </h2>
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
    {#if showDetails && networkSummaries !== undefined}
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
