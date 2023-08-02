<template>
  <div class="block-of-buttons">
    <button
      class="btn btn-outline-primary"
      type="button"
      data-bs-toggle="tooltip"
      data-bs-placement="right"
      title="Group selection into scaffold"
      @click="addScaffoldClicked"
    >
      <i class="bi bi-box-arrow-in-down-right"></i>
    </button>
    <button
      class="btn btn-outline-primary"
      type="button"
      data-bs-toggle="tooltip"
      data-bs-placement="right"
      title="Remove all scaffolds in selection"
      @click="removeScaffoldClicked"
    >
      <i class="bi bi-box-arrow-up-left"></i>
    </button>

    <button
      class="btn btn-outline-primary"
      type="button"
      data-bs-toggle="tooltip"
      data-bs-placement="right"
      title="Export FASTA for selection"
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
  props.mapManager?.eventManager.onAddScaffoldClicked();
}

function removeScaffoldClicked() {
  props.mapManager?.eventManager.onRemoveScaffoldClicked();
}

function exportFASTAForSelectionClicked() {
  props.mapManager?.eventManager.onExportFASTAForSelectionClicked();
}
</script>

<style scoped>
.block-of-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
