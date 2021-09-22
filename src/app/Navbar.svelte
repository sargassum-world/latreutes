<script lang="ts">
  import { QueryClientProvider } from '@sveltestack/svelte-query';

  import NavLink from '../shared/navigation/NavLink.svelte';

  export let connectedToZeroTier;

  const authenticatedMenuItems = [
    { name: 'Home', path: '/' },
    { name: 'Networks', path: 'networks' },
    { name: 'Peers', path: 'peers' },
  ]
</script>

<nav>
  {#if connectedToZeroTier}
    {#each authenticatedMenuItems as { name, path }}
      <NavLink to={path}>{name}</NavLink>
    {/each}
  {/if}
</nav>
