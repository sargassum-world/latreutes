<script lang="ts">
  import { Route } from 'svelte-routing';
  import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';

  import { useConfigPath, useAuthToken } from '../shared/config';

  import { useNodeInfo } from '../zerotier/client/node';

  import Navbar from './Navbar.svelte';
  import HomePage from './home/HomePage.svelte';

  export let toggleTheme;

  const configPathRes = useConfigPath();
  $: authTokenRes = useAuthToken($configPathRes.data);
  $: authToken = $authTokenRes.missing ? '' : $authTokenRes.data;
  $: nodeInfoRes = useNodeInfo(authToken);
  $: authTokenMissing =
    $authTokenRes.status === 'error' || $authTokenRes.data === undefined;
  $: hasNodeInfo =
    $nodeInfoRes.status === 'success' && $nodeInfoRes.data !== undefined;
  $: connectedToZeroTier = !authTokenMissing && hasNodeInfo;
</script>

<div
  class="main-window is-flex is-flex-direction-column-touch is-flex-direction-row-desktop"
>
  <Navbar {connectedToZeroTier} {toggleTheme} />
  <Route>
    <HomePage {authToken} {authTokenMissing} {hasNodeInfo} />
  </Route>
  {#if connectedToZeroTier}
    <Route path="networks">
      <main
        class="is-flex main-container is-flex-direction-column scroller pad-gap"
      >
        <h1 class="title">Networks</h1>
      </main>
    </Route>
    <Route path="peers">
      <main
        class="is-flex main-container is-flex-direction-column scroller pad-gap"
      >
        <h1 class="title">Peers</h1>
      </main>
    </Route>
  {/if}
</div>

<style>
  .main-window {
    height: 100%;
    overflow: hidden;
  }
  .main-container {
    height: 100%;
    width: 100%;
    overflow: auto;
  }
</style>
