<script lang="ts">
  import { crossfade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { Link } from 'svelte-routing';

  import { slide } from '../../shared/transitions';

  import { SERVICE_PORT_ZT, ApiStatus, useApiStatus } from '../client/service';
  import { NetworkSummary, useNetworkSummaries } from '../client/networks';

  import NetworkInfo from '../networks/NetworkInfo.svelte';

  export let authToken;

  const animationOptions = { duration: (d) => 30 * Math.sqrt(d) };
  const [send, receive] = crossfade({ fallback: slide });

  $: networkSummariesRes = useNetworkSummaries(authToken);
  $: networkSummariesStatus = $networkSummariesRes.status;
  $: networkSummaries = $networkSummariesRes.data;
  $: authorizedNetworks = networkSummaries?.filter(
    (network: NetworkSummary) => network.status === 'OK',
  );
  $: unauthorizedNetworks = networkSummaries?.filter(
    (network: NetworkSummary) =>
      network.status === 'REQUESTING_CONFIGURATION' ||
      network.status === 'ACCESS_DENIED',
  );
  $: errorNetworks = networkSummaries?.filter(
    (network: NetworkSummary) =>
      network.status !== 'OK' &&
      network.status !== 'REQUESTING_CONFIGURATION' &&
      network.status !== 'ACCESS_DENIED',
  );
</script>

<main class="main-container scroller">
  {#if !authToken}
    <section class="section content" in:slide|local>
      <h1>Networks</h1>
      <p>Error: the ZeroTier auth token is missing!</p>
    </section>
  {:else if networkSummariesStatus === 'loading'}
    <section class="section content" in:slide|local>
      <h1>Networks</h1>
      <p>Loading...</p>
    </section>
  {:else if networkSummariesStatus === 'error'}
    <section class="section content" in:slide|local>
      <h1>Networks</h1>
      {#if !$networkSummariesRes.error}
        <p>Unknown error!</p>
      {:else}
        <p>Error: {$networkSummariesRes.error.message}</p>
      {/if}
    </section>
  {:else if networkSummariesStatus === 'success'}
    {#if networkSummaries === undefined}
      <section class="section content" in:slide|local>
        <h1>Networks</h1>
        <p>
          Error: received an unexpected response from the ZeroTier service! Is
          some other program running on port {SERVICE_PORT_ZT} instead of the ZeroTier
          service?
        </p>
      </section>
    {:else if networkSummaries.length === 0}
      <section class="section content" in:slide|local>
        <h1>Welcome!</h1>
        <p>
          This device is not yet aware of any ZeroTier virtual networks. You can
          join a network by pressing the &quot;Join a Network&quot; button
          above, or you can host your own network by pressing the &quot;Host a
          Network&quot; button above.
        </p>
      </section>
    {:else}
      <section class="section content" in:slide|local>
        <h1>Authorized Networks</h1>
        <p>
          {#if authorizedNetworks.length === 0}
            This device is not yet authorized by any networks to connect as a
            peer.
          {:else}
            This device is authorized by the following networks to connect as a
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
      </section>
      <section class="section content" in:slide|local>
        <h1>Unauthorized Networks</h1>
        <p>
          {#if unauthorizedNetworks.length === 0}
            This device has not encountered any authorization issues with the
            networks which it's configured to connect to.
          {:else}
            This device is trying to connect as a peer on the following
            networks, but the network has not yet allowed the device to connect:
          {/if}
        </p>
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
      <section class="section content" in:slide|local>
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
    {/if}
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
    max-width: 26em;
  }
</style>
