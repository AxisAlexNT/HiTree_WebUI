<template>
  <div id="vertical-igv-track-div">
    <figure class="text-center vertical">
      <blockquote class="blockquote">
        <p>Very soon horizontal IGV tracks will be here.</p>
      </blockquote>
      <figcaption class="blockquote-footer">
        Someone famous in the <cite title="HiCT Development Team">HiCT Development Team</cite>
      </figcaption>
    </figure>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
#vertical-igv-track-div {
  width: 100%;
  height: 100%;
  /* background-color: lime; */
  border: 1px solid black;
}

.vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}
</style>
