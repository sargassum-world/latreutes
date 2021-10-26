<script lang="ts">
  import { useQueryClient } from '@sveltestack/svelte-query';
  import { Accordion, AccordionItem } from 'svelte-accessible-accordion';
  import Icon from 'mdi-svelte';
  import { mdiChevronDown } from '@mdi/js';

  import { Status, Type, prefetchNetworkInfo } from '../client/network';

  import NetworkName from './NetworkName.svelte';
  import StatusTags from './StatusTags.svelte';
  import BasicDetails from './BasicDetails.svelte';
  import AdvancedDetails from './AdvancedDetails.svelte';
  import Settings from './Settings.svelte';

  export let id: string;
  export let name: string;
  export let status: Status;
  export let type: Type;
  export let bridge: boolean;
  export let portError: number;
  export let authToken: string | undefined;

  const queryClient = useQueryClient();

  let showBasicDetails: boolean;
  let showAdvancedDetails: boolean;
  let showSettings: boolean;

  // We use void to ignore the result of the prefetch promise - if it fails, it's fine
  $: void prefetchNetworkInfo(id, authToken, queryClient);
</script>

<header class="panel-heading">
  <h2 class="network-name"><NetworkName {id} {name} /></h2>
  <div class="tags">
    <StatusTags {status} {type} {bridge} {portError} />
  </div>
</header>
<Accordion multiselect>
  <AccordionItem bind:expanded={showBasicDetails} class="panel-block">
    <span slot="title" class="accordion-header level">
      <h3>Basic Details</h3>
      <span class="icon">
        <Icon path={mdiChevronDown} size="1em" />
      </span>
    </span>
    {#if showBasicDetails}
      <BasicDetails {id} {name} {authToken} />
    {/if}
  </AccordionItem>
  <AccordionItem bind:expanded={showAdvancedDetails} class="panel-block">
    <span slot="title" class="accordion-header level">
      <h3>Advanced Details</h3>
      <span class="icon">
        <Icon path={mdiChevronDown} size="1em" />
      </span>
    </span>
    {#if showAdvancedDetails}
      <AdvancedDetails {id} {authToken} />
    {/if}
  </AccordionItem>
  <AccordionItem bind:expanded={showSettings} class="panel-block">
    <span slot="title" class="accordion-header level">
      <h3>Settings</h3>
      <span class="icon">
        <Icon path={mdiChevronDown} size="1em" />
      </span>
    </span>
    {#if showSettings}
      <Settings {id} {status} {authToken} />
    {/if}
  </AccordionItem>
</Accordion>

<style>
  .network-name {
    font-weight: normal;
    margin-bottom: 0.25em;
    display: inline-flex;
  }
</style>
