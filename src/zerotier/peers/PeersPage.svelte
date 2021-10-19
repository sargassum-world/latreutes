<script lang="ts">
  import { crossfade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { Link } from 'svelte-routing';

  import { slide } from '../../shared/transitions';

  import { SERVICE_PORT_ZT } from '../client/service';
  import { PeerSummary, usePeerSummaries } from '../client/peers';

  import PeerInfo from './PeerInfo.svelte';

  export let authToken;

  const animationOptions = {
    duration: (d) => Math.min(200, 30 * Math.sqrt(d)),
  };
  const [send, receive] = crossfade({
    duration: (d) => Math.min(200, 30 * Math.sqrt(d)),
    fallback: slide,
  });

  $: peerSummariesRes = usePeerSummaries(authToken);
  $: peerSummariesStatus = $peerSummariesRes.status;
  $: peerSummaries = $peerSummariesRes.data;
  $: introducerPeers = peerSummaries?.filter(
    (peer: PeerSummary) => peer.role === 'PLANET' || peer.role === 'MOON',
  );
  $: leafPeers = peerSummaries?.filter(
    (peer: PeerSummary) => peer.role === 'LEAF',
  );
</script>

<main class="main-container scroller">
  <section class="section content">
    <h1>Peers</h1>
    {#if !authToken}
      <p>Error: the ZeroTier auth token is missing!</p>
    {:else if peerSummariesStatus === 'loading'}
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
      {:else}
        <p>
          {#if leafPeers.length === 0}
            This device does not have any peers yet. To find other peers,
            <Link to="/networks">join a network</Link>!
          {:else}
            This device has the following peers, which may be network hosts or
            other devices:
          {/if}
        </p>
        {#each leafPeers as { address, role } (address)}
          <article
            class="panel entity-panel"
            in:receive|local={{ key: address }}
            out:send|local={{ key: address }}
            animate:flip={animationOptions}
          >
            <PeerInfo {address} {role} {authToken} />
          </article>
        {/each}
      {/if}
    {/if}
  </section>
  {#if peerSummariesStatus === 'success' && peerSummaries !== undefined}
    <section class="section content">
      <h1>Peer Introducers</h1>
      <p>
        {#if introducerPeers.length === 0}
          This device is not yet in contact with any peers which can introduce
          it to other peers. Is this device connected to the internet?
        {:else}
          This device can locate other peers by being mutually introduced
          through one of the following special peers:
        {/if}
      </p>
      {#each introducerPeers as { address, role } (address)}
        <article
          class="panel entity-panel"
          in:receive|local={{ key: address }}
          out:send|local={{ key: address }}
          animate:flip={animationOptions}
        >
          <PeerInfo {address} {role} {authToken} />
        </article>
      {/each}
    </section>
  {/if}
</main>

<style>
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
    max-width: 27em;
  }
</style>
