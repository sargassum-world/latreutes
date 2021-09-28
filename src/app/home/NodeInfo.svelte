<script lang="ts">
  import { slide } from '../../shared/transitions';

  import { ApiStatus, useApiStatus } from '../../zerotier/client/service';
  import { useNodeInfo } from '../../zerotier/client/node';

  export let version;
  export let authToken;

  const apiStatusRes = useApiStatus();
  $: apiStatus = $apiStatusRes.data;
  $: nodeInfoRes = useNodeInfo(authToken);
  $: node = $nodeInfoRes.data?.data;
</script>

<div class="card info-card" in:slide|local>
  <div class="content card-content">
    <h2>This Device</h2>
    {#if apiStatus !== ApiStatus.success}
      <p in:slide|local>
        Latreutes Version:
        {#if version === undefined}
          <span class="tag is-danger">Unknown</span>
        {:else}
          v{version}
        {/if}
      </p>
    {:else}
      <div class="content" in:slide|local>
        <h3 class="is-size-6">ZeroTier Address</h3>
        {#if node === undefined}
          <span class="tag is-danger">Unknown</span>
        {:else}
          <span class="tag zerotier-address">{node.address}</span>
        {/if}
        <h3 class="is-size-6">Connection Status</h3>
        {#if node === undefined || !node.online}
          <span class="tag is-danger">Not Connected</span>
        {:else if node.tcpFallbackActive}
          <span class="tag is-warning">On Slow Relay</span>
        {:else}
          <span class="tag is-success">Connected</span>
        {/if}
        <h3 class="is-size-6">Software Versions</h3>
        <p>
          ZeroTier:
          {#if node === undefined}
            <span class="tag is-danger">Unknown</span>
          {:else}
            v{node.version}
          {/if}
        </p>
        <p>
          Latreutes:
          {#if version === undefined}
            <span class="tag is-danger">Unknown</span>
          {:else}
            v{version}
          {/if}
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .card.info-card {
    max-width: 24em;
  }
  .content h3 {
    margin-bottom: 0;
  }
  .content h3:not(:first-child) {
    margin-top: 0.5em;
  }
  .content p:not(:last-child) {
    margin-bottom: 0;
  }
</style>
