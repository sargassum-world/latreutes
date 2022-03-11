<script lang="ts">
  import Icon from 'mdi-svelte';
  import { mdiWhiteBalanceSunny } from '@mdi/js';

  import NavLink from './NavLink.svelte';

  export let connectedToZeroTier: boolean;
  export let toggleTheme: () => void;

  const authenticatedMenuItems = [
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

<nav class="navbar" aria-label="main navigation">
  <div class="navbar-brand left-burger">
    <button
      class="navbar-burger"
      class:is-active={isMenuOpen}
      aria-label="menu"
      aria-expanded={isMenuOpen}
      on:click={toggleMenu}
    >
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </button>

    <NavLink
      to="/"
      {closeMenu}
      class="navbar-item brand-with-logo"
      id="main-nav-brand"
    >
      <img class="navbar-brand-logo" src="/logo.svg" alt="Latreutes logo" />
      Latreutes
    </NavLink>

  </div>
  <div class="navbar-menu" class:is-active={isMenuOpen}>
    <div class="navbar-start">
      {#if connectedToZeroTier}
        {#each authenticatedMenuItems as { name, path } (path)}
          <NavLink to={path} {closeMenu}>{name}</NavLink>
        {/each}
      {/if}
    </div>
    <div class="navbar-end">
      <div class="navbar-item end-buttons">
        <div class="buttons">
          <button
            class="button icon-button is-text"
            id="theme-toggle"
            on:click={toggleTheme}
          >
            <span class="icon is-small">
              <Icon path={mdiWhiteBalanceSunny} size="1em" />
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</nav>
