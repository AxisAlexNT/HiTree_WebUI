<template>
  <div class="saved-locations">
    <div class="input-group">
      <input
        type="text"
        class="form-control m-0"
        placeholder="Location name"
        aria-label="Name of visualization preset"
        v-model="name"
      />
      <button
        class="btn btn-outline-primary"
        type="button"
        title="Load visualization preset"
        data-bs-toggle="tooltip"
        data-bs-placement="bottom"
        @click="setOptionsPreset"
      >
        <i class="bi bi-brush"></i>
      </button>
      <button
        class="btn btn-outline-danger"
        type="button"
        title="Remove saved location"
        data-bs-toggle="tooltip"
        data-bs-placement="bottom"
        @click="$emit('remove', props.option_id)"
      >
        <i class="bi bi-x-square-fill"></i>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";
import VisualizationOptions from "@/app/core/visualization/VisualizationOptions";
import { Coordinate } from "ol/coordinate";
import { ref } from "vue";
import { useVisualizationOptionsStore } from "@/app/stores/visualizationOptionsStore";
import { storeToRefs } from "pinia";
const visualizationOptionsStore = useVisualizationOptionsStore();
const { preLogBase, applyCoolerWeights, postLogBase, colormap } = storeToRefs(
  visualizationOptionsStore
);

import { useStyleStore } from "@/app/stores/styleStore";
const stylesStore = useStyleStore();
const { mapBackgroundColor } = storeToRefs(stylesStore);

const props = defineProps<{
  mapManager?: ContactMapManager;
  option_id: number;
  visualizationOptions: VisualizationOptions;
  backgroundColor: string;
}>();

const emits = defineEmits<{
  (e: "remove", location_id: number): void;
}>();

const name = ref("Preset " + props.option_id);

function setOptionsPreset() {
  if (props.mapManager) {
    visualizationOptionsStore.setVisualizationOptions(
      props.visualizationOptions
    );
    stylesStore.setMapBackground(props.backgroundColor);
    props.mapManager?.visualizationManager
      .sendVisualizationOptionsToServer()
      .then(() => props.mapManager?.reloadTiles());
  }
}
</script>
<style scoped>
.saved-locations {
  /* layer */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0px;
  /* gap: 20px; */

  width: 100%;
  height: 40px;
  margin-left: 10px;
  margin-right: 10px;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}
</style>
