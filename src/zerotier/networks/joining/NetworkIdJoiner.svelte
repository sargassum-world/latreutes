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

  import { identifierTypes, submission } from './JoinForm.svelte';
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

{#if id && authToken && networkInfoStatus !== 'idle' && networkInfoStatus !== 'loading'}
  {#if joinAttempted}
    {#if !hasNetworkInfo}
      <p transition:fade|local>
        Joining <NetworkId {id} />...
      </p>
      {#if cancelledJoin}
        <p>Cancelled join attempt!</p>
      {:else}
        <button class="button" on:click={leaveNetwork}>Cancel</button>
      {/if}
    {:else}
      <p transition:fade|local>
        Attempted to join <NetworkId {id} />!
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
        <p transition:fade|local>Cancelled join attempt!</p>
      {:else}
        <button class="button" on:click={leaveNetwork} transition:fade|local>
          {#if networkInfo.status === 'OK'}
            Disconnect from network
          {:else}
            Don't join network
          {/if}
        </button>
      {/if}
    {/if}
  {:else if hasNetworkInfo && networkInfo.id === id}
    <p transition:fade|local>
      This device has already tried to join the network with ZeroTier network ID
      <NetworkId {id} />.
    </p>
  {:else}
    <p transition:fade|local>
      Checking whether this device has already tried to join <NetworkId
        {id}
      />...
    </p>
  {/if}
{/if}

<style>
  .tags {
    display: inline;
  }
  .button {
    margin-right: 0.5em;
    margin-bottom: 0.5em;
  }
</style>
