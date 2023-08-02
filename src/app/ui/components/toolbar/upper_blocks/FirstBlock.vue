<template>
  <div class="block-of-buttons">
    <button
      class="btn btn-outline-primary"
      type="button"
      data-bs-toggle="tooltip"
      data-bs-placement="right"
      title="Zoom out"
      @click="zoomOut"
    >
      <i class="bi bi-arrows-fullscreen"></i>
    </button>
    <button
      class="btn btn-outline-primary"
      type="button"
      data-bs-toggle="tooltip"
      data-bs-placement="right"
      title="Zoom In"
      @click="zoomIn"
    >
      <i class="bi bi-search"></i>
    </button>
    <button
      class="btn btn-outline-primary"
      type="button"
      data-bs-toggle="tooltip"
      data-bs-placement="right"
      title="Slide to the main diagonal vertically"
      @click="slideVertically"
    >
      <i class="bi bi-arrow-down-up"></i>
    </button>
    <button
      class="btn btn-outline-primary"
      type="button"
      data-bs-toggle="tooltip"
      data-bs-placement="right"
      title="Slide to the main diagonal horizontally"
      @click="slideHorizontally"
    >
      <i class="bi bi-arrow-left-right"></i>
    </button>
    <button
      class="btn btn-outline-primary"
      type="button"
      data-bs-toggle="tooltip"
      data-bs-placement="right"
      title="Slide to the main diagonal over counter-diagonal"
      @click="slideByCounterDiagonal"
    >
      <i class="bi bi-arrows-angle-contract"></i>
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
function zoomIn() {
  if (props.mapManager) {
    const map = props.mapManager?.map;
    const view = map?.getView();
    // const center = view?.getCenter();
    if (map && view) {
      view.animate({ zoom: 10e10 });
    }
  }
}

function slideVertically() {
  if (props.mapManager) {
    const map = props.mapManager?.map;
    const view = map?.getView();
    const center = view?.getCenter();
    if (map && view && center) {
      view.animate({
        center: [center[0], -center[0]],
        zoom: view.getZoom(),
      });
    }
  }
}

function slideHorizontally() {
  if (props.mapManager) {
    const map = props.mapManager?.map;
    const view = map?.getView();
    const center = view?.getCenter();
    if (map && view && center) {
      view.animate({
        center: [-center[1], center[1]],
        zoom: view.getZoom(),
      });
    }
  }
}

function slideByCounterDiagonal() {
  if (props.mapManager) {
    const map = props.mapManager?.map;
    const view = map?.getView();
    const center = view?.getCenter();
    if (map && view && center) {
      view.animate({
        center: [(center[0] - center[1]) / 2, -(center[0] - center[1]) / 2],
        zoom: view.getZoom(),
      });
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
