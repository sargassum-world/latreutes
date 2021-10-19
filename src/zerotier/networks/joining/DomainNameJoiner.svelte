<script lang="ts">
  import { fade } from 'svelte/transition';

  import { useTxtResolver } from '../../../shared/dns';
  import { slide } from '../../../shared/transitions';

  import DNS_ZT_NETWORK_KEY from '../../client/dns';

  import NetworkId from '../NetworkId.svelte';

  import NetworkIdJoiner from './NetworkIdJoiner.svelte';

  import NoTxtRecords from './messages/NoTxtRecords.svelte';
  import NoNetworkIdRecord from './messages/NoNetworkIdRecord.svelte';
  import MultipleNetworkIdRecords from './messages/MultipleNetworkIdRecords.svelte';
  import EmptyNetworkIdRecord from './messages/EmptyNetworkIdRecord.svelte';

  export let domainName;
  export let authToken;

  const recordPrefix = `${DNS_ZT_NETWORK_KEY}=`;

  $: txtRecordsRes = useTxtResolver(domainName);
  $: hasTxtRecords =
    $txtRecordsRes.status === 'success' && $txtRecordsRes.data !== undefined;
  $: records = $txtRecordsRes.data?.filter((record) =>
    record.startsWith(recordPrefix),
  );
  $: id =
    records === undefined ? undefined : records[0]?.slice(recordPrefix.length);
  $: showJoiner = domainName && authToken;
  $: txtRecordsSuccess = $txtRecordsRes.status === 'success';
</script>

{#if showJoiner && $txtRecordsRes.status === 'error'}
  <article class="message is-danger" transition:slide|local>
    <NoTxtRecords {domainName} />
  </article>
{:else if showJoiner && txtRecordsSuccess && (records === undefined || records.length === 0)}
  <article class="message is-danger" transition:slide|local>
    <NoNetworkIdRecord {domainName} />
  </article>
{:else if showJoiner && txtRecordsSuccess && records.length > 1}
  <article class="message is-danger" transition:slide|local>
    <MultipleNetworkIdRecords {domainName} />
  </article>
{:else if showJoiner && txtRecordsSuccess && !id}
  <article class="message is-danger" transition:slide|local>
    <EmptyNetworkIdRecord {domainName} />
  </article>
{:else if showJoiner && txtRecordsSuccess}
  <div in:fade|local>
    <p>
      The network named by <span class="tag domain-name">{domainName}</span> has
      ZeroTier network ID <NetworkId {id} />.
    </p>
    <NetworkIdJoiner {id} expectedName={domainName} {authToken} />
  </div>
{:else if showJoiner}
  <p in:fade|local>
    Looking up the ZeroTier network for <span class="tag domain-name"
      >{domainName}</span
    >...
  </p>
{/if}
