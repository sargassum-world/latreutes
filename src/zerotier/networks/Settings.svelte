<script lang="ts">
  import { useQueryClient } from '@sveltestack/svelte-query';

  import { slide } from '../../shared/transitions';

  import { Status, useNetworkLeaver } from '../client/network';

  export let id: string;
  export let status: Status;
  export let authToken: string | undefined;

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
