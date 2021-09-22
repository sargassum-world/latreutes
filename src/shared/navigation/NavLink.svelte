<script>
  import { Link } from 'svelte-routing';

  export let to='';

  function getProps({ location, href, isPartiallyCurrent, isCurrent }) {
    const isActive = href === '/' ? isCurrent : isPartiallyCurrent || isCurrent;

    if (!isActive) {
      return {};
    }

    // The object returned here is spread on the anchor element's attributes
    return { class: 'active' };
  }
</script>

<Link to={to} getProps="{getProps}">
  <slot />
</Link>
