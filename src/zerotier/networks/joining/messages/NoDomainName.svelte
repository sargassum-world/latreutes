<script lang="ts">
  export let name: string;
  export let nameExpected: boolean;
</script>

<div class="message-header">
  {#if nameExpected}
    Unexpected name
  {:else}
    No confirmed domain name
  {/if}
</div>
<div class="message-body">
  This network
  {#if nameExpected}
    is actually named
  {:else}
    declares its name as
  {/if}
  <span class="is-family-monospace">{name}</span>, which does not seem to be a
  domain name pointing to this network. If you expected the network to have a
  different name, this may be the wrong network and you should disconnect from
  it in order to protect your device.
</div>
