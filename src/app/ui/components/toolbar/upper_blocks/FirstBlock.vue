<template>
  <div class="block-of-buttons">
    <button class="btn btn-outline-primary" type="button">
      <i class="bi bi-arrow-left-right"></i>
    </button>
    <button
      class="btn btn-outline-primary"
      type="button"
      data-bs-toggle="tooltip"
      data-bs-placement="right"
      title="Zoom out"
      @click="zoomOut"
    >
      <i class="bi bi-arrows-angle-expand"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";

const props = defineProps<{
  readonly mapManager?: ContactMapManager | undefined;
}>();

function zoomOut() {
  if (props.mapManager) {
    const map = props.mapManager?.map;
    const view = map?.getView();
    if (map && view) {
      view.animate({ zoom: 0 });
    }
  }
}
</script>

<style scoped>
.block-of-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
