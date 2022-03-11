<script lang="ts">
  import { fade } from 'svelte/transition';

  import type { Status, Type } from '../client/network';

  export let status: Status;
  export let type: Type;
  export let bridge: boolean;
  export let portError: number;

  const statusTags = {
    OK: {
      label: () => 'Authorized',
      type: 'success',
    },
    REQUESTING_CONFIGURATION: {
      label: () => 'Requesting Information',
      type: 'info',
    },
    ACCESS_DENIED: {
      label: () => 'Access Denied',
      type: 'danger',
    },
    NOT_FOUND: {
      label: () => 'Not Found',
      type: 'danger',
    },
    PORT_ERROR: {
      label: ({ portError }: { portError: number }) =>
        `Port Error ${portError}`,
      type: 'danger',
    },
    CLIENT_TOO_OLD: {
      label: () => 'Incompatible Version',
      type: 'danger',
    },
    undefined: undefined,
  };

  $: statusTag = statusTags[status];
</script>

{#if statusTag !== undefined}
  {#key statusTag.label({ portError })}
    <span class={`tag is-${statusTag.type}`} in:fade|local
      >{statusTag.label({ portError })}</span
    >
  {/key}
{/if}
<!--TODO: add a tag if the network is self-hosted, by comparing the network ID's address section with the node ID-->
{#if type === 'PUBLIC'}
  <span class="tag is-warning" transition:fade|local>Public</span>
{/if}
{#if bridge}
  <span class="tag is-info" transition:fade|local>Bridge</span>
{/if}

<style>
  .tag {
    font-weight: normal;
  }
</style>
