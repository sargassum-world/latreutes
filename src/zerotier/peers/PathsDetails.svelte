<script lang="ts">
  import { crossfade } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  import { slide, crossfadeFade } from '../../shared/transitions';

  import { usePeerInfo } from '../client/peer';

  import PathDetails from './PathDetails.svelte';

  export let address: string;
  export let authToken: string | undefined;

  const animationOptions = { duration: (d: number) => 30 * Math.sqrt(d) };
  const [send, receive] = crossfade({ fallback: crossfadeFade });

  $: peerInfoRes = usePeerInfo(address, authToken);
  $: peerInfoStatus = $peerInfoRes.status;
  $: peerInfo = $peerInfoRes.data?.data;
</script>

<div class="accordion-content" transition:slide|local>
  {#if peerInfoStatus === 'loading'}
    Loading...
  {:else if peerInfo === undefined}
    <p class="tag is-warning">Unknown</p>
  {:else if peerInfo.paths.length == 0}
    <p class="tag is-warning">None</p>
  {:else}
    {#each peerInfo.paths as path (path.address)}
      <div
        class="content"
        in:receive|local={{ key: path.address }}
        out:send|local={{ key: path.address }}
        animate:flip={animationOptions}
      >
        <PathDetails {path} />
      </div>
    {/each}
  {/if}
</div>

<style>
  .accordion-content p:not(:last-child) {
    margin-bottom: 0;
  }
</style>
