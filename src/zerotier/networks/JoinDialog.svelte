<script lang="ts">
  import { slide } from '../../shared/transitions';

  import JoinForm, { identifierTypes, submission } from './JoinForm.svelte';
  import NetworkId from './NetworkId.svelte';

  type IdentifierType = 'domain-name' | 'network-id';

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
    <p>
      Here is the form response for {identifierTypes[$submission.identifierType]
        .name}
      {$submission.identifier}!
    </p>
    <button class="button is-primary" on:click={resetForm}>
      Join another network
    </button>
  </div>
{/if}
