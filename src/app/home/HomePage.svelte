<script>
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
  export let hasNodeInfo;

  const versionRes = useVersion();
  const apiStatusRes = useApiStatus();

  $: hasVersion = $versionRes.data !== undefined;
  $: version = $versionRes.data;
  $: hasApi = $apiStatusRes.data === ApiStatus.success;
  $: networkSummariesRes = useNetworkSummaries(authToken);
  $: hasNoNetworks =
    $networkSummariesRes.status === 'success' &&
    $networkSummariesRes.data !== undefined &&
    $networkSummariesRes.data.length === 0;
  $: showWelcome = !hasApi || authTokenMissing || !hasNodeInfo || hasNoNetworks;
</script>

<main class="info-card-container scroller">
  {#if showWelcome}
    <WelcomeInfo {hasNodeInfo} />
  {/if}
  {#if !hasVersion}
    <BrowserRunError />
  {:else if !hasApi}
    <ApiInfo />
  {:else if authTokenMissing || !hasNodeInfo}
    <AuthInfo {authToken} />
  {/if}
  <NodeInfo {version} {authToken} />
</main>

<style>
  .info-card-container {
    width: 100%;
    height: 100%;
    overflow: auto;
  }
</style>
