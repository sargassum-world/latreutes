<script lang="ts">
  import { useVersion } from '../../shared/config';

  import { ApiStatus, useApiStatus } from '../../zerotier/client/service';
  import { useNetworkSummaries } from '../../zerotier/client/networks';

  import WelcomeInfo from './WelcomeInfo.svelte';
  import BrowserRunError from './BrowserRunError.svelte';
  import ApiInfo from './ApiInfo.svelte';
  import AuthInfo from './AuthInfo.svelte';
  import NodeInfo from './NodeInfo.svelte';

  export let authToken;
  export let authTokenMissing;
  export let nodeInfoMissing;

  const versionRes = useVersion();
  const apiStatusRes = useApiStatus();

  $: hasVersion = $versionRes.data !== undefined;
  $: version = $versionRes.data;
  $: apiMissing =
    $apiStatusRes.status === 'success' &&
    $apiStatusRes.data !== ApiStatus.success;
  $: networkSummariesRes = useNetworkSummaries(authToken);
  $: hasNoNetworks =
    $networkSummariesRes.status === 'success' &&
    $networkSummariesRes.data !== undefined &&
    $networkSummariesRes.data.length === 0;
  $: showWelcome =
    apiMissing || authTokenMissing || nodeInfoMissing || hasNoNetworks;
</script>

<main class="main-container scroller">
  {#if showWelcome}
    <WelcomeInfo {nodeInfoMissing} />
  {/if}
  {#if !hasVersion}
    <BrowserRunError />
  {:else if apiMissing}
    <ApiInfo />
  {:else if authTokenMissing || nodeInfoMissing}
    <AuthInfo {authToken} />
  {/if}
  <NodeInfo {version} {authToken} />
</main>
