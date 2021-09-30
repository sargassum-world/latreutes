<script lang="ts">
  import { crossfade, fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  import { useTxtResolver } from '../../shared/dns';
  import { slide } from '../../shared/transitions';

  import { useNetworkInfo } from '../client/network';
  import { checkNetworkDomainName } from '../client/network';

  import NetworkId from './NetworkId.svelte';

  export let id;
  export let name;
  export let authToken;

  const animationOptions = { duration: (d) => 30 * Math.sqrt(d) };
  const [send, receive] = crossfade({ fallback: fade });

  $: networkInfoRes = useNetworkInfo(id, authToken);
  $: networkInfoStatus = $networkInfoRes.status;
  $: networkInfo = $networkInfoRes.data?.data;
  $: hasNetworkInfo =
    networkInfoStatus === 'success' && networkInfo !== undefined;
  $: txtRecordsRes = useTxtResolver(name);
  $: hasName = name !== undefined && name.length > 0;
  $: hasConfirmedDomainName = checkNetworkDomainName(
    name,
    id,
    $txtRecordsRes.data,
    $txtRecordsRes.status,
  );
</script>

<div class="accordion-content" transition:slide|local>
  {#if networkInfoStatus === 'loading'}
    Loading...
  {:else if networkInfo === undefined}
    <p class="tag is-warning">Unknown</p>
  {:else}
    <h4 class="is-size-6">
      {#if hasConfirmedDomainName}
        Confirmed Domain Name
      {:else}
        Declared Name
      {/if}
    </h4>
    {#if networkInfo.name.length === 0}
      <p class="tag is-warning">
        {#if networkInfo.status !== 'OK'}
          Unknown
        {:else}
          None
        {/if}
      </p>
    {:else}
      <p>{networkInfo.name}</p>
    {/if}
    <h4 class="is-size-6">ZeroTier Network ID</h4>
    <NetworkId {id} />
    <h4 class="is-size-6">Network-Assigned IP Addresses</h4>
    {#if networkInfo.assignedAddresses.length === 0}
      <p class="tag is-warning">
        {#if networkInfo.status !== 'OK'}
          Unknown
        {:else}
          None
        {/if}
      </p>
    {:else}
      {#each networkInfo.assignedAddresses as address (address)}
        <p
          class="tag ip-address"
          in:receive|local={{ key: address }}
          out:send|local={{ key: address }}
          animate:flip={animationOptions}
        >
          {address.split('/')[0]}
        </p>
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
  .accordion-content .ip-address:not(:last-child) {
    margin-bottom: 0.25em;
  }
</style>
