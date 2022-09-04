<template>
  <div class="block-of-buttons">
    <button
      class="btn btn-outline-primary"
      type="button"
      @click="addScaffoldClicked"
    >
      <i class="bi bi-box-arrow-in-down-right"></i>
    </button>
    <button
      class="btn btn-outline-primary"
      type="button"
      @click="removeScaffoldClicked"
    >
      <i class="bi bi-box-arrow-up-left"></i>
    </button>

    <button
      class="btn btn-outline-primary"
      type="button"
      @click="exportFASTAForSelectionClicked"
    >
      <i class="bi bi-type"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";

const props = defineProps<{
  mapManager?: ContactMapManager | undefined;
}>();

function addScaffoldClicked() {
  props.mapManager?.onAddScaffoldClicked();
}

function removeScaffoldClicked() {
  props.mapManager?.onRemoveScaffoldClicked();
}

function exportFASTAForSelectionClicked() {
  props.mapManager?.onExportFASTAForSelectionClicked();
}
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
  /* height: 76px; */

  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}
</style>
