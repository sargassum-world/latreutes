<script lang="ts">
  import { Route } from 'svelte-routing';
  import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';

  import { useConfigPath, useAuthToken } from '../shared/config';

  import { useNodeInfo } from '../zerotier/client/node';

  import Navbar from './Navbar.svelte';

  export let theme;
  export let toggleTheme;

  const configPathRes = useConfigPath();
  $: authTokenRes = useAuthToken($configPathRes.data);
  $: nodeInfoRes = useNodeInfo($authTokenRes.missing ? '' : $authTokenRes.data);
  $: authTokenMissing =
    $authTokenRes.status === 'error' || $authTokenRes.data === undefined;
  $: hasNodeInfo =
    $nodeInfoRes.status === 'success' && $nodeInfoRes.data !== undefined;
  $: connectedToZeroTier = !authTokenMissing && hasNodeInfo;
</script>

<div
  class="main-window is-flex is-flex-direction-column-touch is-flex-direction-row-desktop"
>
  <Navbar {connectedToZeroTier} {theme} {toggleTheme} />
  <div
    class="is-flex main-container is-flex-direction-column is-flex-grow-1 scroller pad-gap"
  >
    <Route>
      <h1 class="title">Home</h1>
      <div class="content">
        <p class="subtitle">Latreutes is an application!</p>
      </div>
    </Route>
    {#if connectedToZeroTier}
      <Route path="networks">
        <h1 class="title">Networks</h1>
      </Route>
      <Route path="peers">
        <h1 class="title">Peers</h1>
      </Route>
    {/if}
  </div>
</div>

<style>
  .main-window {
    height: 100%;
    overflow: hidden;
  }
  .main-container {
    width: 100%;
    overflow: auto;
  }
</style>
