<script lang="ts">
  import { Route } from 'svelte-routing';
  import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';

  import { useConfigPath, useAuthToken } from '../shared/config';

  import { useNodeInfo } from '../zerotier/client/node';

  import Navbar from './Navbar.svelte';

  const configPathRes = useConfigPath();
  $: authTokenRes = useAuthToken($configPathRes.data);
  $: nodeInfoRes = useNodeInfo($authTokenRes.missing ? '' : $authTokenRes.data)
  $: authTokenMissing = $authTokenRes.status === 'error' || $authTokenRes.data === undefined;
  $: hasNodeInfo = $nodeInfoRes.status === 'success' && $nodeInfoRes.data !== undefined;
  $: connectedToZeroTier = !authTokenMissing && hasNodeInfo;

</script>

<Navbar {connectedToZeroTier} />
<Route path="/">
  <section class="section">
    <div class="container">
      <h1 class="title">
        Home
      </h1>
      <p class="subtitle">
        Latreutes is an application!
      </p>
    </div>
  </section>
</Route>
<Route path="networks">Networks page!</Route>
<Route path="peers">Peers page!</Route>
