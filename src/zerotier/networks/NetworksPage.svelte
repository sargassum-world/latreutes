<script lang="ts">
  import { crossfade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { Link } from 'svelte-routing';

  import { slide } from '../../shared/transitions';

  import { SERVICE_PORT_ZT, ApiStatus, useApiStatus } from '../client/service';
  import { NetworkSummary, useNetworkSummaries } from '../client/networks';

  import NetworkInfo from '../networks/NetworkInfo.svelte';

  export let authToken;

  const sectionOutOptions = { delay: 800 };
  const animationOptions = { duration: (d) => Math.min(800, 30 * Math.sqrt(d)) };
  const [send, receive] = crossfade({ fallback: slide });

  $: networkSummariesRes = useNetworkSummaries(authToken);
  $: networkSummariesStatus = $networkSummariesRes.status;
  $: networkSummaries = $networkSummariesRes.data;
  $: authorizedNetworks = networkSummaries?.filter(
    (network: NetworkSummary) => network.status === 'OK',
  );
  $: hasAuthorizedNetworks = authorizedNetworks !== undefined && authorizedNetworks.length > 0;
  $: connectingNetworks = networkSummaries?.filter(
    (network: NetworkSummary) => network.status === 'REQUESTING_CONFIGURATION',
  );
  $: hasConnectingNetworks = connectingNetworks !== undefined && connectingNetworks.length > 0;
  $: unauthorizedNetworks = networkSummaries?.filter(
    (network: NetworkSummary) => network.status === 'ACCESS_DENIED',
  );
  $: hasUnauthorizedNetworks = unauthorizedNetworks !== undefined && unauthorizedNetworks.length > 0;
  $: errorNetworks = networkSummaries?.filter(
    (network: NetworkSummary) =>
      network.status !== 'OK' &&
      network.status !== 'REQUESTING_CONFIGURATION' &&
      network.status !== 'ACCESS_DENIED',
  );
  $: hasErrorNetworks = errorNetworks !== undefined && errorNetworks.length > 0;
</script>

<main class="main-container scroller">
  <section class="section content">
    <h1>Networks</h1>
    {#if !authToken}
      <p>Error: the ZeroTier auth token is missing!</p>
    {:else if networkSummariesStatus === 'loading'}
      <p>Loading...</p>
    {:else if networkSummariesStatus === 'error'}
      {#if !$networkSummariesRes.error}
        <p>Unknown error!</p>
      {:else}
        <p>Error: {$networkSummariesRes.error.message}</p>
      {/if}
    {:else if networkSummariesStatus === 'success'}
      {#if networkSummaries === undefined}
        <p>
          Error: received an unexpected response from the ZeroTier service! Is
          some other program running on port {SERVICE_PORT_ZT} instead of the ZeroTier
          service?
        </p>
      {:else if networkSummaries.length === 0}
        <p>
          This device is not yet aware of any ZeroTier virtual networks. You can
          join a network by pressing the &quot;Join a Network&quot; button
          above, or you can host your own network by pressing the &quot;Host a
          Network&quot; button above.
        </p>
      {:else}
        <p>
          {#if authorizedNetworks.length === 0}
            This device is not yet allowed by any networks to connect as a
            peer.
          {:else}
            This device is allowed by the following networks to connect as a
            peer, and it is configured to connect to them:
          {/if}
        </p>
        {#each authorizedNetworks as { id, name, status, type, bridge, portError } (id)}
          <article
            class="panel entity-panel"
            in:receive|local={{ key: id }}
            out:send|local={{ key: id }}
            animate:flip={animationOptions}
          >
            <NetworkInfo
              {id}
              {name}
              {status}
              {authToken}
              {type}
              {portError}
              {bridge}
            />
          </article>
        {/each}
      {/if}
    {/if}
  </section>
  <section class="section content" class:empty-section={!hasConnectingNetworks}>
    {#if hasConnectingNetworks}
      <div class="section-description" in:slide|local out:slide|local={sectionOutOptions}>
        <h1>Connecting</h1>
        <p>
          This device is trying to connect as a peer on the following
          networks:
        </p>
      </div>
    {/if}
    {#each connectingNetworks as { id, name, status, type, bridge, portError } (id)}
      <article
        class="panel entity-panel"
        in:receive|local={{ key: id }}
        out:send|local={{ key: id }}
        animate:flip={animationOptions}
      >
        <NetworkInfo
          {id}
          {name}
          {status}
          {authToken}
          {type}
          {portError}
          {bridge}
        />
      </article>
    {/each}
  </section>
  <section class="section content" class:empty-section={!hasUnauthorizedNetworks}>
    {#if hasUnauthorizedNetworks}
      <div class="section-description" in:slide|local out:slide|local={sectionOutOptions}>
        <h1>No Access</h1>
        <p>
          This device is trying to connect as a peer on the following
          networks, but the network has not yet allowed the device to connect:
        </p>
      </div>
    {/if}
    {#each unauthorizedNetworks as { id, name, status, type, bridge, portError } (id)}
      <article
        class="panel entity-panel"
        in:receive|local={{ key: id }}
        out:send|local={{ key: id }}
        animate:flip={animationOptions}
      >
        <NetworkInfo
          {id}
          {name}
          {status}
          {authToken}
          {type}
          {portError}
          {bridge}
        />
      </article>
    {/each}
  </section>
  <section class="section content" class:empty-section={!hasErrorNetworks}>
    {#if hasErrorNetworks}
      <div class="section-description" in:slide|local out:slide|local={sectionOutOptions}>
        <h1>Errors</h1>
        <p>
          {#if errorNetworks.length === 0}
            This device has not encountered any errors connecting to the
            networks which it's configured to connect to.
          {:else}
            This device is trying to connect as a peer on the following
            networks, but some technical error has occurred in trying to connect
            to them:
          {/if}
        </p>
      </div>
    {/if}
    {#each errorNetworks as { id, name, status, type, bridge, portError } (id)}
      <article
        class="panel entity-panel"
        in:receive|local={{ key: id }}
        out:send|local={{ key: id }}
        animate:flip={animationOptions}
      >
        <NetworkInfo
          {id}
          {name}
          {status}
          {authToken}
          {type}
          {portError}
          {bridge}
        />
      </article>
    {/each}
  </section>
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
    max-width: 26em;
  }
</style>
