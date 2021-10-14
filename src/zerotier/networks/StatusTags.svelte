<script lang="ts">
  import { fade } from 'svelte/transition';

  export let status;
  export let type;
  export let bridge;
  export let portError;

  const statusTags = {
    OK: {
      label: ({}) => 'Authorized',
      type: 'success',
    },
    REQUESTING_CONFIGURATION: {
      label: ({}) => 'Requesting Information',
      type: 'info',
    },
    ACCESS_DENIED: {
      label: ({}) => 'Access Denied',
      type: 'danger',
    },
    NOT_FOUND: {
      label: ({}) => 'Not Found',
      type: 'danger',
    },
    PORT_ERROR: {
      label: ({ portError }) => `Port Error ${portError}`,
      type: 'danger',
    },
    CLIENT_TOO_OLD: {
      label: ({}) => 'Incompatible Version',
      type: 'danger',
    },
    undefined: undefined,
  };

  $: statusTag = statusTags[status];
</script>

{#if statusTag !== undefined}
  <span class={`tag is-${statusTag.type}`} transition:fade|local
    >{statusTag.label({ portError })}</span
  >
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
