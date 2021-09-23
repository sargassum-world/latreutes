<script>
  import { Link } from 'svelte-routing';

  export let to = '';
  export let closeMenu;

  function getProps({ location, href, isPartiallyCurrent, isCurrent }) {
    const isActive = href === '/' ? isCurrent : isPartiallyCurrent || isCurrent;

    if (!isActive) {
      return { class: 'navbar-item' };
    }

    // The object returned here is spread on the anchor element's attributes
    return { class: 'navbar-item is-active' };
  }
</script>

<Link {to} {getProps} on:click={closeMenu}>
  <slot />
</Link>
