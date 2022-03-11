<script lang="ts">
  import { slide } from '../../../shared/transitions';

  import JoinForm, { submission } from './JoinForm.svelte';
  import NetworkIdJoiner from './NetworkIdJoiner.svelte';
  import DomainNameJoiner from './DomainNameJoiner.svelte';

  export let authToken: string | undefined;
  export let closeJoin: () => void;

  let showForm = true;

  function hideForm() {
    showForm = false;
  }
  function resetForm() {
    showForm = true;
  }
</script>

{#if showForm}
  <div transition:slide|local>
    <JoinForm afterSubmit={hideForm} />
  </div>
{:else if $submission.identifierType === 'domain-name' && $submission.identifier !== undefined}
  <div transition:slide|local>
    <p>
      Looking for a ZeroTier network in the domain name records for
      <span class="tag domain-name">{$submission.identifier}</span>...
    </p>
    <DomainNameJoiner domainName={$submission.identifier} {authToken} />
  </div>
{:else if $submission.identifierType === 'network-id' && $submission.identifier !== undefined}
  <div transition:slide|local>
    <NetworkIdJoiner
      id={$submission.identifier}
      expectedName={undefined}
      {authToken}
    />
  </div>
{:else}
  <div transition:slide|local>
    Error: unknown network identifier type or missing identifier!
  </div>
{/if}
<div class="buttons is-padded">
  {#if showForm}
    <button class="button" on:click={closeJoin}> Close Panel </button>
  {:else if !showForm && $submission.identifier !== undefined}
    <button class="button is-primary" on:click={resetForm}>
      Join another network
    </button>
    <button class="button is-primary" on:click={closeJoin}>
      Close Panel
    </button>
  {:else if !showForm}
    <button class="button is-primary" on:click={resetForm}> Try again </button>
    <button class="button is-primary" on:click={closeJoin}>
      Close Panel
    </button>
  {/if}
</div>
