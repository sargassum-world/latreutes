<script>
  // This file was copied from https://github.com/reecelucas/svelte-accessible-dialog,
  // which was published by reecelucas under the MIT license.

  import DialogPortal from './DialogPortal.svelte';
  import DialogOverlayInner from './DialogOverlayInner.svelte';

  // Props
  export let onDismiss;
  export let initialFocusElement = null;
  export let returnFocusElement = null;
  export let ariaModalLegacy = false;
</script>

<DialogPortal>
  <DialogOverlayInner
    {...$$restProps}
    {onDismiss}
    {initialFocusElement}
    {returnFocusElement}
    {ariaModalLegacy}
  >
    <slot />
  </DialogOverlayInner>
</DialogPortal>
