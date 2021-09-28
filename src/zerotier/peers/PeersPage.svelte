<script lang="ts">
  import { crossfade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { Link } from 'svelte-routing';

  import { slide } from '../../shared/transitions';

  import { SERVICE_PORT_ZT, ApiStatus, useApiStatus } from '../client/service';
  import { PeerSummary, usePeerSummaries } from '../client/peers';

  import PeerInfo from './PeerInfo.svelte';

  export let authToken;

  const animationOptions = { duration: (d) => 30 * Math.sqrt(d) };
  const [send, receive] = crossfade({ fallback: slide });

  $: peerSummariesRes = usePeerSummaries(authToken);
  $: peerSummariesStatus = $peerSummariesRes.status;
  $: peerSummaries = $peerSummariesRes.data;
  $: introducerPeers =
    peerSummaries === undefined
      ? undefined
      : peerSummaries.filter(
          (peer: PeerSummary) => peer.role === 'PLANET' || peer.role === 'MOON',
        );
  $: leafPeers =
    peerSummaries === undefined
      ? undefined
      : peerSummaries.filter((peer: PeerSummary) => peer.role === 'LEAF');
</script>

<main class="main-container scroller">
  <section class="section content">
    <h1>Peers</h1>
    {#if peerSummariesStatus === 'loading'}
      <p>Loading...</p>
    {:else if peerSummariesStatus === 'error'}
      {#if !$peerSummariesRes.error}
        <p>Unknown error!</p>
      {:else}
        <p>Error: {$peerSummariesRes.error.message}</p>
      {/if}
    {:else if peerSummariesStatus === 'success'}
      {#if peerSummaries === undefined}
        <p>
          Error: received an unexpected response from the ZeroTier service! Is
          some other program running on port {SERVICE_PORT_ZT} instead of the ZeroTier
          service?
        </p>
      {:else if leafPeers.length > 0}
        <p>
          This device has the following peers, which may be network hosts or
          other devices:
        </p>
        {#each leafPeers as peer (peer.address)}
          <article
            class="panel entity-panel"
            in:receive|local={{ key: peer.address }}
            out:send|local={{ key: peer.address }}
            animate:flip={animationOptions}
          >
            <PeerInfo address={peer.address} role={peer.role} {authToken} />
          </article>
        {/each}
      {:else}
        <p>
          This device does not have any peers yet. To add a peer, <Link
            to="/networks">join a network</Link
          >!
        </p>
      {/if}
    {/if}
  </section>
  {#if peerSummariesStatus === 'success' && peerSummaries !== undefined}
    <section class="section content">
      <h1>Peer Introducers</h1>
      <p>
        This device can locate other peers by being mutually introduced through
        one of the following special peers:
      </p>
      {#each introducerPeers as peer (peer.address)}
        <article
          class="panel entity-panel"
          in:receive|local={{ key: peer.address }}
          out:send|local={{ key: peer.address }}
          animate:flip={animationOptions}
        >
          <PeerInfo address={peer.address} role={peer.role} {authToken} />
        </article>
      {/each}
    </section>
  {/if}
</main>

<style>
  .main-container {
    width: 100%;
    height: 100%;
    overflow: auto;
  }
  section:not(:first-child) {
    padding-top: 0;
  }
  section:last-child {
    padding-bottom: 0;
  }
  .content:not(:last-child) {
    margin-bottom: 0;
  }
  .panel.entity-panel {
    max-width: 28em;
  }
</style>
