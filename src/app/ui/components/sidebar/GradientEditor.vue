<template>
  <div id="gradient-editor-div">
    <div class="gradient-btn-div">
      <button
        id="gradient-button"
        class="btn btn-outline-primary"
        type="button"
        data-bs-toggle="tooltip"
        data-bs-placement="bottom"
        title="Edit heatmap colors"
        @click="editCurves"
      >
        <i class="bi bi-palette"></i>
        <i class="bi bi-brush-fill"></i>
        <span id="gradient-btn-text">Edit heatmap colors</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
function editCurves() {}
</script>

<style scoped>
#gradient-editor-div {
  margin-top: 5px;
  margin-bottom: 5px;
  margin-left: 0px;
  margin-right: 0px;
  width: 100%;
  text-align: left;
  /* height: 200px; */
}
</style>
