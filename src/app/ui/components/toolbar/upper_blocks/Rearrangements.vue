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
  /* block of buttons2 */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;

  width: 44px;
  height: 76px;

  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}
</style>
