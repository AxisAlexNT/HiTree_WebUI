<template>
  <div class="block-of-buttons">
    <button
      class="btn btn-outline-primary"
      type="button"
      @click="props.mapManager?.eventManager.onReverseSelectionClicked"
    >
      <i class="bi bi-arrow-repeat"></i>
    </button>
    <button
      class="btn btn-outline-primary"
      type="button"
      @click="props.mapManager?.eventManager.onMoveSelectionClicked"
    >
      <i class="bi bi-arrows-move"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";

const props = defineProps<{
  readonly mapManager?: ContactMapManager | undefined;
}>();
</script>

<style scoped>
.block-of-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
