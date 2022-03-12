<script lang="ts">
  import { crossfade } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  import { slide, crossfadeFade } from '../../shared/transitions';

  import { usePeerInfo } from '../client/peer';
  import { splitNetworkId } from '../client/network';
  import type { NetworkSummary } from '../client/networks';

  import NetworkName from '../networks/NetworkName.svelte';

  export let address: string;
  export let authToken: string | undefined;
  export let networkSummaries: Array<NetworkSummary>;

  const animationOptions = { duration: (d: number) => 30 * Math.sqrt(d) };
  const [send, receive] = crossfade({ fallback: crossfadeFade });

  $: peerInfoRes = usePeerInfo(address, authToken);
  $: peerInfoStatus = $peerInfoRes.status;
  $: peerInfo = $peerInfoRes.data?.data;
  $: hostedNetworks = networkSummaries?.filter(
    (network: NetworkSummary) =>
      splitNetworkId(network.id).hostAddress === address,
  );
</script>

<div class="accordion-content" transition:slide|local>
  {#if peerInfoStatus === 'loading'}
    Loading...
  {:else if peerInfo === undefined}
    <p class="tag is-warning">Unknown</p>
  {:else}
    <h4 class="is-size-6">ZeroTier Address</h4>
    <p class="tag zerotier-address">{address}</p>
    <h4 class="is-size-6">Estimated Latency</h4>
    {#if peerInfo.latency >= 0}
      <p>{peerInfo.latency} ms</p>
    {:else}
      <p class="tag is-warning">Unknown</p>
    {/if}
    <h4 class="is-size-6">ZeroTier Version</h4>
    {#if peerInfo.versionMajor >= 0}
      <p>
        v{peerInfo.versionMajor}.{peerInfo.versionMinor}.{peerInfo.versionRev}
      </p>
    {:else}
      <p class="tag is-warning">Unknown</p>
    {/if}
    <h4 class="is-size-6">Hosted Networks</h4>
    {#if hostedNetworks === undefined || hostedNetworks.length == 0}
      <p class="tag is-warning">Unknown</p>
    {:else}
      {#each hostedNetworks as network (network.id)}
        <div
          class="network-name"
          in:receive|local={{ key: network.id }}
          out:send|local={{ key: network.id }}
          animate:flip={animationOptions}
        >
          <NetworkName id={network.id} name={network.name} />
        </div>
      {/each}
    {/if}
  {/if}
</div>

<style>
  .accordion-content h4 {
    margin-bottom: 0;
  }
  .accordion-content h4:not(:first-child) {
    margin-top: 0.5em;
  }
  .accordion-content p:not(:last-child) {
    margin-bottom: 0;
  }
  .network-name:not(:last-child) {
    margin-bottom: 0.25em;
  }
</style>
