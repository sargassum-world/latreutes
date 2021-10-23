<script lang="ts">
  import { Link } from 'svelte-routing';

  export let to = '';
  export let closeMenu = (): void => {
    /* do nothing by default */
  };

  function getProps({
    href,
    isPartiallyCurrent,
    isCurrent,
  }: {
    href: string;
    isPartiallyCurrent: boolean;
    isCurrent: boolean;
  }) {
    const isActive = href === '/' ? isCurrent : isPartiallyCurrent || isCurrent;

    if (!isActive) {
      return { class: 'navbar-item' };
    }

    // The object returned here is spread on the anchor element's attributes
    return { class: 'navbar-item is-active' };
  }
</script>

<Link {to} {getProps} on:click={closeMenu} {...$$restProps}>
  <slot />
</Link>
