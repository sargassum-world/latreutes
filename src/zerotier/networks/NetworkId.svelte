<script lang="ts">
  import { splitNetworkId } from '../client/network';

  export let id;

  $: networkSplitId = splitNetworkId(id);
</script>

<span class="zerotier-network-id">
  <span class="tag zerotier-network-host">{networkSplitId.hostAddress}</span
  ><span class="tag zerotier-network-number"
    >{networkSplitId.networkNumber}</span
  >
</span>
<!-- TODO: add tooltip linking to the network's entity panel on the Networks page, and the network's entity panel should have tooltips linking to the hosting peer on the Peers page -->
