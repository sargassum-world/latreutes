<script lang="ts">
  import { crossfade, fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { useQueryClient } from '@sveltestack/svelte-query';

  import { useTxtResolver } from '../../shared/dns';
  import { slide } from '../../shared/transitions';

  import { useNetworkLeaver } from '../client/network';

  import NetworkId from './NetworkId.svelte';

  export let id;
  export let status;
  export let authToken;

  const animationOptions = { duration: (d) => 30 * Math.sqrt(d) };
  const [send, receive] = crossfade({ fallback: fade });

  const queryClient = useQueryClient();

  $: networkLeaver = useNetworkLeaver(id, authToken, queryClient);

  function leaveNetwork() {
    $networkLeaver.mutate();
  }
</script>

<div class="accordion-content" transition:slide|local>
  <button class="button" on:click={leaveNetwork}>
    {#if status === 'OK'}
      Disconnect from network
    {:else}
      Don't join network
    {/if}
  </button>
</div>
