<script lang="ts">
  import { Router } from 'svelte-routing';
  import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';

  import MainWindow from './app/MainWindow.svelte';

  // Used for SSR; falsy value is ignored by Router
  export let url = '';

  const queryClient = new QueryClient();
</script>

<svelte:head>
<style src="scss-entrypoint.scss"></style>
</svelte:head>

<QueryClientProvider client={queryClient}>
  <Router url="{url}">
    <MainWindow />
  </Router>
</QueryClientProvider>
