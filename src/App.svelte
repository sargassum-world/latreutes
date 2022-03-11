<script lang="ts">
  import { Router } from 'svelte-routing';
  import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';
  import DarkMode from 'svelte-dark-mode';
  import '@fontsource/atkinson-hyperlegible/400.css';
  import '@fontsource/atkinson-hyperlegible/400-italic.css';
  import '@fontsource/atkinson-hyperlegible/700.css';
  import '@fontsource/atkinson-hyperlegible/700-italic.css';
  import '@fontsource/oxygen-mono/400.css';

  import MainWindow from './app/MainWindow.svelte';

  // Used for SSR; falsy value is ignored by Router
  export let url = '';

  const queryClient = new QueryClient();

  let theme: 'dark' | 'light';
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
    <link id="dark-theme" rel="stylesheet" href="/build/theme-dark.css" />
  {:else}
    <link id="light-theme" rel="stylesheet" href="/build/theme-light.css" />
  {/if}
</svelte:head>

<DarkMode bind:theme />
<QueryClientProvider client={queryClient}>
  <Router {url}>
    <MainWindow {toggleTheme} />
  </Router>
</QueryClientProvider>
