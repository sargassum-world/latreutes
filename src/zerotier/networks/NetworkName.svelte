<script lang="ts">
  import { useTxtResolver } from '../../shared/dns';

  import { splitNetworkId, checkNetworkDomainName } from '../client/network';

  export let id;
  export let name;

  $: networkSplitId = splitNetworkId(id);
  $: txtRecordsRes = useTxtResolver(name);
</script>

{#if checkNetworkDomainName(name, id, $txtRecordsRes.data, $txtRecordsRes.status)}
  <span class="tag domain-name">{name}</span>
{:else if !name}
  <span class="zerotier-network-id">
    <span class="tag zerotier-network-host">{networkSplitId.hostAddress}</span
    ><span class="tag zerotier-network-number"
      >{networkSplitId.networkNumber}</span
    >
  </span>
{:else}
  <span class="tag zerotier-unknown-network">
    <span class="zerotier-network-id">
      <span class="tag zerotier-network-host">{networkSplitId.hostAddress}</span
      ><span class="tag zerotier-network-number"
        >{networkSplitId.networkNumber}</span
      >
    </span>
    <span class="tag zerotier-network-name">{name}</span>
  </span>
{/if}
<!-- TODO: add tooltip linking to the network's entity panel on the Networks page, and the network's entity panel should have tooltips linking to the hosting peer on the Peers page -->
