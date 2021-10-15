<script lang="ts">
  import { fade } from 'svelte/transition';
  import { useQueryClient } from '@sveltestack/svelte-query';

  import { slide } from '../../../shared/transitions';

  import {
    useNetworkJoiner,
    useNetworkLeaver,
    useNetworkInfo,
  } from '../../client/network';

  import NetworkId from '../NetworkId.svelte';
  import StatusTags from '../StatusTags.svelte';

  import JoinMessages from './JoinMessages.svelte';

  export let id;
  export let expectedName;
  export let authToken;

  const queryClient = useQueryClient();

  $: networkJoiner = useNetworkJoiner(authToken, queryClient);
  $: networkLeaver = useNetworkLeaver(id, authToken, queryClient);
  $: networkInfoRes = useNetworkInfo(id, authToken);
  $: networkInfoStatus = $networkInfoRes.status;
  $: networkInfo = $networkInfoRes.data?.data;
  $: hasNetworkInfo =
    networkInfoStatus === 'success' && networkInfo !== undefined;
  $: hasEmptyNetworkInfo = hasNetworkInfo && networkInfo.status === undefined;
  $: missingNetworkInfo = networkInfoStatus === 'error' || hasEmptyNetworkInfo;
  $: showJoiner =
    id &&
    authToken &&
    networkInfoStatus !== 'idle' &&
    networkInfoStatus !== 'loading';

  let joinAttempted = false;
  $: if (!joinAttempted && authToken && id && missingNetworkInfo) {
    // This only runs once with the provided id; if the id changes, it will not
    // attempt to join the new id. Instead, the component mounted with the old
    // id should be destroyed, and then a new instance should be created with
    // the new id.
    $networkJoiner.mutate(id);
    joinAttempted = true;
  }

  let cancelledJoin = false;
  function leaveNetwork() {
    $networkLeaver.mutate();
    cancelledJoin = true;
  }
</script>

{#if showJoiner && joinAttempted && !hasNetworkInfo}
  <p in:fade|local>
    Joining <NetworkId {id} />...
  </p>
  {#if cancelledJoin}
    <p in:fade|local>Cancelled join attempt!</p>
  {:else}
    <button class="button" on:click={leaveNetwork}>Cancel</button>
  {/if}
{:else if showJoiner && joinAttempted}
  <div in:fade|local>
    <p>
      Attempting to join <NetworkId {id} />...
      {#if networkInfo.status !== undefined}
        <br />
        Status:
      {/if}
      <span class="tags">
        <StatusTags
          status={networkInfo.status}
          type={networkInfo.type}
          bridge={networkInfo.bridge}
          portError={networkInfo.portError}
        />
      </span>
    </p>
    <JoinMessages
      {id}
      name={networkInfo.name}
      status={networkInfo.status}
      type={networkInfo.type}
      {expectedName}
    />
    {#if cancelledJoin}
      <p in:fade|local>Cancelled join attempt!</p>
    {:else}
      <button class="button" on:click={leaveNetwork} in:fade|local>
        {#if networkInfo.status === 'OK'}
          Disconnect from network
        {:else}
          Don't join network
        {/if}
      </button>
    {/if}
  </div>
{:else if showJoiner && hasNetworkInfo && networkInfo.id === id}
  <p in:fade|local>
    This device has already tried to join the network with ZeroTier network ID
    <NetworkId {id} />.
  </p>
{:else if showJoiner}
  <p in:fade|local>
    Checking whether this device has already tried to join <NetworkId {id} />...
  </p>
{/if}

<style>
  .tags {
    display: inline;
  }
  .button {
    margin-right: 0.5em;
    margin-bottom: 0.5em;
  }
  p:last-child {
    margin-bottom: 1em;
  }
</style>
