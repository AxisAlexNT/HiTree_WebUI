<template>
  <div class="block-of-buttons">
    <button
      class="btn btn-outline-primary"
      type="button"
      data-bs-toggle="tooltip"
      data-bs-placement="right"
      title="Reverse selection"
      @click="props.mapManager?.eventManager.onReverseSelectionClicked"
    >
      <i class="bi bi-arrow-repeat"></i>
    </button>
    <button
      class="btn"
      :class="{
        'btn-primary': translocationMode,
        'btn-outline-primary': !translocationMode,
      }"
      type="button"
      data-bs-toggle="tooltip"
      data-bs-placement="right"
      title="Enter translocation mode"
      ref="translocationButton"
      @click="translocationClick"
    >
      <i class="bi bi-arrows-move"></i>
    </button>
    <button
      class="btn btn-outline-primary"
      type="button"
      data-bs-toggle="tooltip"
      data-bs-placement="right"
      data-bs-html="true"
      title="Split contig at bin"
      @click="props.mapManager?.eventManager.onSplitContigClicked"
    >
      <i class="bi bi-scissors"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ContactMapManager } from "@hict/app/core/mapmanagers/ContactMapManager";
import { ref } from "vue";

const props = defineProps<{
  readonly mapManager?: ContactMapManager | undefined;
}>();

const translocationMode = ref(false);

function translocationClick() {
  props.mapManager?.eventManager.onMoveSelectionClicked();
}
</script>

<style scoped>
.block-of-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
