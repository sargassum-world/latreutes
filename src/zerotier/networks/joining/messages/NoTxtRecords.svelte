<script lang="ts">
  export let domainName;
</script>

<div class="message-header">Domain name records not found</div>
<div class="message-body">
  Could not find any domain name records for <span class="tag domain-name"
    >{domainName}</span
  >!
  <br />
  Did you enter a valid domain name? Are you connected to the internet, or at least
  to the server which stores the records for the domain name?
</div>
