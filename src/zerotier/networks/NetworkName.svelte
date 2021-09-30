<script lang="ts">
  import { useTxtResolver } from '../../shared/dns';

  import { splitNetworkId, checkNetworkDomainName } from '../client/network';

  import NetworkId from './NetworkId.svelte';

  export let id;
  export let name;

  $: networkSplitId = splitNetworkId(id);
  $: txtRecordsRes = useTxtResolver(name);
  $: hasName = name !== undefined && name.length > 0;
</script>

{#if checkNetworkDomainName(name, id, $txtRecordsRes.data, $txtRecordsRes.status)}
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
