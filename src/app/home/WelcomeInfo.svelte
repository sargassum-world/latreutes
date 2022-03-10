<script lang="ts">
  import { Link } from 'svelte-routing';

  import { slide } from '../../shared/transitions';

  export let authTokenMissing: boolean;
  export let apiMissing: boolean;
</script>

<div class="card info-card" in:slide|local>
  <div class="content card-content">
    <h1>Welcome!</h1>
    <p>
      This program wants to make it easy for you to manage your connections to
      ZeroTier virtual networks, and to host your own networks.
    </p>
    <p>
      ZeroTier virtual networks help you connect programs running on your device
      directly to programs on other devices of your choosing, anywhere in the
      world, with a simpler and safer setup process than making your device
      accessible over the public internet.
    </p>
    {#if !authTokenMissing && !apiMissing}
      <p>
        To get started, please click on the <Link to="/networks">Networks</Link>
        button in the navigation menu.
      </p>
    {/if}
  </div>
</div>
