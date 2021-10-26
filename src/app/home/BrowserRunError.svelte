<script lang="ts">
  import { slide } from '../../shared/transitions';
</script>

<div class="card info-card" in:slide|local>
  <div class="content card-content">
    <h2>Oops!</h2>
    <p>
      It looks like you&apos;re trying to run this program in a web browser. You
      should run the desktop application version of this program instead,
      because this program does not work in the browser.
    </p>
  </div>
</div>

<style>
  .card.info-card {
    max-width: 24em;
  }
</style>
