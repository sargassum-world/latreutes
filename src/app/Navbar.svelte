<script lang="ts">
  import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';

  import { useConfigPath, useAuthToken } from '../shared/config';
  import NavLink from '../shared/navigation/NavLink.svelte';

  /* import { useNodeStatus } from './zerotier/node'; */

  const queryClient = new QueryClient();

  const configPathRes = useConfigPath();
  $: authTokenRes = useAuthToken($configPathRes.data);
  $: authTokenMissing = $authTokenRes.status === 'error' || $authTokenRes.data === undefined;
  /* $: nodeInfoRes = useNodeStatus(authTokenMissing ? '' : authToken) */
  /* $: hasNodeInfo = $nodeInfoRes.status === 'success' && $nodeInfoRes.data !== undefined; */

  const authenticatedMenuItems = [
    { name: 'Home', path: '/' },
    { name: 'Networks', path: 'networks' },
    { name: 'Peers', path: 'peers' },
  ]
  $: menuItems = authTokenMissing /*|| !hasNodeInfo*/ ? [] : authenticatedMenuItems;
</script>

<nav>
  <NavLink to="/">Home</NavLink>
  <NavLink to="networks">Networks</NavLink>
  <NavLink to="peers">Peers</NavLink>
</nav>
<div>
  Config Path: {$configPathRes.data}
  Auth token: {$authTokenRes.data}
</div>
