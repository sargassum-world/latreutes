<script lang="ts">
  import { useTxtResolver } from '../../shared/dns';

  import { checkNetworkDomainName } from '../client/network';

  import NetworkId from './NetworkId.svelte';

  export let id: string;
  export let name: string;

  $: hasName = name !== undefined && name.length > 0;
  $: txtRecordsRes = useTxtResolver(name);
  $: hasConfirmedDomainName = checkNetworkDomainName(
    name,
    id,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    $txtRecordsRes.data,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    $txtRecordsRes.status,
  );
</script>

{#if hasConfirmedDomainName}
  <span class="tag domain-name">{name}</span>
{:else}
  <span class="tag scoped-name" class:zerotier-unknown-network-named={hasName}>
    <NetworkId {id} />
    {#if hasName}
      <span class="tag zerotier-network-name">{name}</span>
    {/if}
  </span>
{/if}
<!-- TODO: add tooltip linking to the network's entity panel on the Networks page, and the network's entity panel should have tooltips linking to the hosting peer on the Peers page -->
