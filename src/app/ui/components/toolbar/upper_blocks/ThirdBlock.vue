<template>
  <div class="block-of-buttons">
    <button
      class="btn btn-outline-primary"
      type="button"
      data-bs-toggle="tooltip"
      data-bs-placement="right"
      title="Save current location"
    >
      <i class="bi bi-bookmark-plus"></i>
    </button>
    <button
      class="btn btn-outline-primary"
      type="button"
      data-bs-toggle="tooltip"
      data-bs-placement="right"
      title="Move selection to debris"
      @click="moveToDebrisClicked"
    >
      <i class="bi bi-trash"></i>
    </button>
    <button class="btn btn-outline-primary" type="button">
      <i class="bi bi-crop"></i>
    </button>
    <button class="btn btn-outline-primary" type="button">
      <i class="bi bi-plus-lg"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";

const props = defineProps<{
  mapManager?: ContactMapManager | undefined;
}>();

function moveToDebrisClicked() {
  props.mapManager?.eventManager.onMoveToDebrisClicked();
}
</script>

<style scoped>
.block-of-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
