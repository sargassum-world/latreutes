<script lang="ts">
  import { Router, Route } from 'svelte-routing';
  import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';

  import Navbar from './app/Navbar.svelte';

  // Used for SSR; falsy value is ignored by Router
  export let url = '';

  const queryClient = new QueryClient();
</script>

<svelte:head>
<style src="scss-entrypoint.scss"></style>
</svelte:head>

<QueryClientProvider client={queryClient}>
  <Router url="{url}">
    <Navbar />
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
  </Router>
</QueryClientProvider>
