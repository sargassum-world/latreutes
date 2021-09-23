<script lang="ts">
  import { Router } from 'svelte-routing';
  import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';
  import DarkMode from 'svelte-dark-mode';

  import MainWindow from './app/MainWindow.svelte';

  // Used for SSR; falsy value is ignored by Router
  export let url = '';

  const queryClient = new QueryClient();

  let theme;
  $: document.body.className = theme;

  function toggleTheme() {
    if (theme === 'dark') {
      theme = 'light';
      return;
    }

    theme = 'dark';
  }
</script>

<svelte:head>
  {#if theme === 'dark'}
    <style src="bulma-dark.scss"></style>
  {:else}
    <style src="bulma-light.scss"></style>
  {/if}
</svelte:head>

<DarkMode bind:theme />
<QueryClientProvider client={queryClient}>
  <Router {url}>
    <MainWindow {theme} {toggleTheme} />
  </Router>
</QueryClientProvider>
