<script lang="ts">
  import { slide } from '../../../shared/transitions';

  import JoinForm, {
    IdentifierType,
    identifierTypes,
    submission,
  } from './JoinForm.svelte';
  import NetworkIdJoiner from './NetworkIdJoiner.svelte';
  import DomainNameJoiner from './DomainNameJoiner.svelte';

  export let authToken;

  let showForm = true;
  let identifierType: IdentifierType = 'domain-name';

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
{:else}
  <div transition:slide|local>
    {#if $submission.identifierType === 'domain-name'}
      <DomainNameJoiner domainName={$submission.identifier} {authToken} />
    {:else if $submission.identifierType === 'network-id'}
      <NetworkIdJoiner
        id={$submission.identifier}
        expectedName={undefined}
        {authToken}
      />
    {:else}
      Error: unknown network identifier type!
    {/if}
    <button class="button is-primary" on:click={resetForm}>
      Join another network
    </button>
  </div>
{/if}
