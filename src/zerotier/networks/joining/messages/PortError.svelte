<script lang="ts">
  import { useShellOpener } from '../../../../shared/shell';

  const platformRes = usePlatform();
  const shellOpener = useShellOpener();

  function openPortErrorTroubleshooting() {
    const shellOpener = useShellOpener();
    switch ($platformRes.data) {
      case 'macOS':
        shellOpener.mutate(
          'https://zerotier.atlassian.net/wiki/spaces/SD/pages/7241787/PORT+ERROR+on+Mac',
        );
        break;
      case 'windows':
        shellOpener.mutate(
          'https://zerotier.atlassian.net/wiki/spaces/SD/pages/35455014/PORT+ERROR+on+Windows',
        );
        break;
      default:
        shellOpener.mutate(
          'https://zerotier.atlassian.net/wiki/spaces/SD/pages/29065282/Command+Line+Interface+zerotier-cli',
        );
    }
  }
</script>

<div class="message-header">Port error</div>
<div class="message-body">
  There seems to be a problem with the ZeroTier driver. Please refer to the
  <button
    role="link"
    class="button is-ghost is-ahref"
    on:click={openPortErrorTroubleshooting}
  >
    ZeroTier Knowledge Base
  </button>
  to troubleshoot this problem.
</div>
