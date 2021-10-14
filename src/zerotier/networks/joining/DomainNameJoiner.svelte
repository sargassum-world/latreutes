<script lang="ts">
  import { slide } from '../../../shared/transitions';

  import { identifierTypes, submission } from './JoinForm.svelte';
  import NetworkId from '../NetworkId.svelte';

  export let domainName;
  export let authToken;
</script>

<p>
  Here is the form response for domain name {domainName}!
</p>
