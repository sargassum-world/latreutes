<script lang="ts">
  import { QueryClientProvider } from '@sveltestack/svelte-query';

  import NavLink from './NavLink.svelte';

  export let connectedToZeroTier;
  export let theme;
  export let toggleTheme;

  const authenticatedMenuItems = [
    { name: 'Home', path: '/' },
    { name: 'Networks', path: 'networks' },
    { name: 'Peers', path: 'peers' },
  ];

  let isMenuOpen = false;
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
</script>

<nav class="navbar is-{theme}" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <button
      class="navbar-burger"
      class:is-active={isMenuOpen}
      role="button"
      aria-label="menu"
      aria-expanded={isMenuOpen}
      on:click={toggleMenu}
    >
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </button>
  </div>
  <div class="navbar-menu" class:is-active={isMenuOpen}>
    <div class="navbar-start">
      {#if connectedToZeroTier}
        {#each authenticatedMenuItems as { name, path }}
          <!--<NavLink class="navbar-item" to={path}>{name}</NavLink>-->
          <NavLink to={path}>{name}</NavLink>
        {/each}
      {/if}
    </div>
    <div class="navbar-end">
      <div class="navbar-item">
        <div class="buttons">
          <button class="button is-primary" on:click={toggleTheme}>
            Toggle Dark Mode
          </button>
        </div>
      </div>
    </div>
  </div>
</nav>
