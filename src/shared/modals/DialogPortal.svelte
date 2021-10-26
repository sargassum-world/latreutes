<script>
  // This file was copied from https://github.com/reecelucas/svelte-accessible-dialog,
  // which was published by reecelucas under the MIT license.

  import { onMount } from 'svelte';

  let ref;
  let portal;

  onMount(() => {
    // Create and append a DOM node to `document.body`
    // and render the component into it.
    portal = document.createElement('div');
    portal.setAttribute('data-svelte-dialog-portal', 'true');
    document.body.appendChild(portal);
    portal.appendChild(ref);

    return () => {
      document.body.removeChild(portal);
    };
  });
</script>

<div bind:this={ref}>
  <slot />
</div>
