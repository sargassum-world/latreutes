<script lang="ts">
  import { useQueryClient } from '@sveltestack/svelte-query';

  import { slide } from '../../shared/transitions';

  import { useNetworkLeaver } from '../client/network';

  export let id;
  export let status;
  export let authToken;

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
