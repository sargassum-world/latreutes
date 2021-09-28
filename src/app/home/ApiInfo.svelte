<script lang="ts">
  import { useShellOpener } from '../../shared/shell';
  import { slide } from '../../shared/transitions';

  import {
    SERVICE_URL_ZT,
    ApiStatus,
    useApiStatus,
  } from '../../zerotier/client/service';

  const ZT_DOWNLOAD_URL = 'https://zerotier.com/download/';

  const apiStatusRes = useApiStatus();
  const shellOpener = useShellOpener();

  $: apiStatus = $apiStatusRes.data;
</script>

<div class="card info-card" in:slide|local>
  <div class="content card-content">
    <h2>Run the ZeroTier Service</h2>
    {#if apiStatus === ApiStatus.failedRequest}
      <p in:slide|local>
        In order for this program to work, your computer needs to be running the
        ZeroTier service. If you haven&apos;t already installed ZeroTier, you
        will need to install it from
        <button
          class="button is-ghost is-ahref"
          on:click={() => $shellOpener.mutate(ZT_DOWNLOAD_URL)}
        >
          {ZT_DOWNLOAD_URL}
        </button>. Once you&apos;ve installed and started ZeroTier, this message will
        automatically disappear.
      </p>
    {:else if apiStatus === ApiStatus.incorrectService}
      <p in:slide|local>
        In order for this program to work, your computer needs to be running the
        ZeroTier service so that it&apos;s accessible at
        <code>{SERVICE_URL_ZT}</code>. There is a service running at that URL,
        but it does not behave in the expected way. It is likely that some other
        service is running there, and the ZeroTier service might not be running.
      </p>
      {#if $apiStatusRes.error}
        <p>{$apiStatusRes.error}</p>
      {/if}
    {:else}
      <p>API Status: {apiStatus}</p>
    {/if}
  </div>
</div>
