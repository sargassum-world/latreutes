<script lang="ts">
  import { QueryClientProvider } from '@sveltestack/svelte-query';
  import Icon from 'mdi-svelte';
  import { mdiWhiteBalanceSunny } from '@mdi/js';

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
  function closeMenu() {
    isMenuOpen = false;
  }
</script>

<nav class="navbar" role="navigation" aria-label="main navigation">
  <div class="navbar-brand left-burger">
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
          <NavLink to={path} {closeMenu}>{name}</NavLink>
        {/each}
      {/if}
    </div>
    <div class="navbar-end">
      <div class="navbar-item">
        <div class="buttons">
          <button class="button is-{theme}" id="theme-toggle" on:click={toggleTheme}>
            <span class="icon is-small">
              <Icon path={mdiWhiteBalanceSunny} size="1em" />
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</nav>

<style lang="scss">
  .navbar-brand.left-burger {
    align-items: flex-start;
  }
  .navbar-brand.left-burger .navbar-burger {
    margin-left: 0;
    margin-right: 0;
  }
</style>
