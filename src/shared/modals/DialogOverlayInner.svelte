<script>
  // This file was adapted from https://github.com/reecelucas/svelte-accessible-dialog,
  // which was published by reecelucas under the MIT license.

  import LockScroll from './LockScroll.svelte';
  import TrapFocus from './TrapFocus.svelte';
  import TrapScreenReader from './TrapScreenReader.svelte';

  // Props
  export let onDismiss;
  export let initialFocusElement;
  export let returnFocusElement;
  export let ariaModalLegacy;

  let background;
  let outerClickTarget;

  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      onDismiss();
    }
  };

  function handleOuterMousedown(event) {
    if (event.target === background) {
      outerClickTarget = event.target;
    }
  }
  function handleOuterMouseup(event) {
    if (event.target === outerClickTarget) {
      event.preventDefault();
      onDismiss();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<TrapScreenReader enabled={ariaModalLegacy}>
  <TrapFocus {initialFocusElement} {returnFocusElement}>
    <LockScroll>
      <div
        {...$$restProps}
        data-svelte-dialog-overlay
        bind:this={background}
        on:mousedown|self|stopPropagation={handleOuterMousedown}
        on:mouseup|self|stopPropagation={handleOuterMouseup}
      >
        <slot />
      </div>
    </LockScroll>
  </TrapFocus>
</TrapScreenReader>
