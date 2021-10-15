<script lang="ts">
  export let domainName;
</script>

<div class="message-header">Incorrect record configuration</div>
<div class="message-body">
  Multiple ZeroTier network IDs are published in the domain name records for
  <span class="tag domain-name">{domainName}</span>, but only one network ID is
  allowed!
  <br />
  Did the operator of the domain name incorectly configure the domain name records?
</div>
