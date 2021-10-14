<script lang="ts">
  export let name;
  export let nameExpected;
</script>

<div class="message-header">
  {#if nameExpected}
    Unexpected domain name
  {:else}
    Domain name
  {/if}
</div>
<div class="message-body">
  This network is
  {#if nameExpected}
    actually
  {/if}
  named
  <span class="tag domain-name">{name}</span>, which is confirmed as a domain
  name pointing to this network. If you expected the network to have a different
  name, this may be the wrong network and you should disconnect from it in order
  to protect your device.
</div>
