<script lang="ts">
  import { Route } from 'svelte-routing';

  import { useConfigPath, useAuthToken } from '../shared/config';

  import { useNodeInfo } from '../zerotier/client/node';
  import NetworksPage from '../zerotier/networks/NetworksPage.svelte';
  import PeersPage from '../zerotier/peers/PeersPage.svelte';

  import Navbar from './Navbar.svelte';
  import HomePage from './home/HomePage.svelte';

  export let toggleTheme;

  const configPathRes = useConfigPath();
  $: authTokenRes = useAuthToken($configPathRes.data);
  $: authToken = $authTokenRes.missing ? '' : $authTokenRes.data;
  $: nodeInfoRes = useNodeInfo(authToken);
  $: hasAuthToken =
    $authTokenRes.status === 'success' && $authTokenRes.data !== undefined;
  $: authTokenMissing =
    $authTokenRes.status === 'error'
      ? true
      : $authTokenRes.status === 'success' && $authTokenRes.data === undefined;
  $: hasNodeInfo =
    $nodeInfoRes.status === 'success' && $nodeInfoRes.data !== undefined;
  $: nodeInfoMissing = $nodeInfoRes.status === 'error';
  $: connectedToZeroTier = hasAuthToken && hasNodeInfo;
</script>

<div
  class="main-window is-flex is-flex-direction-column-touch is-flex-direction-row-desktop"
>
  <Navbar {connectedToZeroTier} {toggleTheme} />
  <Route>
    <HomePage {authToken} {authTokenMissing} {nodeInfoMissing} />
  </Route>
  {#if connectedToZeroTier}
    <Route path="networks">
      <NetworksPage {authToken} />
    </Route>
    <Route path="peers">
      <PeersPage {authToken} />
    </Route>
  {/if}
</div>
