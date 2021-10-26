<script lang="ts">
  export let domainName: string;
</script>

<div class="message-header">Network not found</div>
<div class="message-body">
  Could not find any ZeroTier network IDs published in the domain name records
  for
  <span class="tag domain-name">{domainName}</span>!
  <br />
  Did you enter a valid domain name?
</div>
