<template>
  <aside class="sidebar">
    <div id="upper-block">
      <div id="minimap"></div>

      <div id="color-range">
        <ContrastSelector :map-manager="props.mapManager" />
      </div>

      <div id="saved-locations">
        <SavedLocations></SavedLocations>
      </div>
    </div>

    <div id="layers-block">
      <!-- Instantiate layer components here using v-for -->
      <LayerComponent
        v-for="layer in layers"
        v-bind:key="layer.name"
        v-bind:layer-name="layer.name"
      ></LayerComponent>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";
import LayerComponent from "@/app/ui/components/sidebar/LayerComponent.vue";
import SavedLocations from "@/app/ui/components/sidebar/SavedLocations.vue";
import { ref, type Ref } from "vue";
import ContrastSelector from "./ContrastSelector.vue";

const props = defineProps<{
  mapManager?: ContactMapManager;
}>();

class LayerDescriptor {
  name: string;
  layer_manager: object | null;

  constructor(name: string) {
    this.name = name;
    this.layer_manager = null;
  }
}

const layers: Ref<Array<LayerDescriptor>> = ref([
  new LayerDescriptor("Contigs"),
  new LayerDescriptor("Scaffolds"),
  new LayerDescriptor("Something"),
]);
</script>

<style scoped>
.sidebar {
  /* sidebar */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  gap: 1px;

  width: 232px;

  right: 0px;
  top: 109px;

  /* Global/07. Light */
  background: #f8f9fa;
  background-color: green;

  /* Shadows/02. Regular */
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.15);
}

#upper-block {
  /* upper block */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  gap: 4px;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

#layers-block {
  /* layers */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  gap: 8px;

  width: 232px;
  height: 108px;

  /* Global/09. White */
  background: #ffffff;

  /* Shadows/01. Small */
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.075);

  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}

#minimap {
  height: 20px;
  background-color: grey;
}

#color-range {
  /* color range */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;

  /* Global/09. White */
  background: #ffffff;

  /* Shadows/01. Small */
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.075);

  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}

#saved-locations {
  /* saved locations */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  padding: 16px 0px;
  gap: 8px;

  /* Global/09. White */
  background: #ffffff;

  /* Shadows/01. Small */
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.075);
}
</style>
