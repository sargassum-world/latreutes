<script lang="ts">
  import { slide } from '../../../shared/transitions';

  import JoinForm, { submission } from './JoinForm.svelte';
  import NetworkIdJoiner from './NetworkIdJoiner.svelte';
  import DomainNameJoiner from './DomainNameJoiner.svelte';

  export let authToken: string | undefined;

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
    <button class="button is-primary" on:click={resetForm}>
      Join another network
    </button>
  </div>
{:else if $submission.identifierType === 'network-id' && $submission.identifier !== undefined}
  <div transition:slide|local>
    <NetworkIdJoiner
      id={$submission.identifier}
      expectedName={undefined}
      {authToken}
    />
    <button class="button is-primary" on:click={resetForm}>
      Join another network
    </button>
  </div>
{:else}
  <div transition:slide|local>
    Error: unknown network identifier type or missing identifier!
    <button class="button is-primary" on:click={resetForm}> Try again </button>
  </div>
{/if}
