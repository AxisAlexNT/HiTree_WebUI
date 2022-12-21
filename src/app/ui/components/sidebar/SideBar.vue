<template>
  <aside class="sidebar">
    <div id="upper-block">
      <div id="minimap"></div>

      <div id="color-range" v-if="props.mapManager">
        <ContrastSelector :map-manager="props.mapManager" />
      </div>

      <div id="saved-locations">
        <SavedLocations></SavedLocations>
      </div>
    </div>

    <div id="layers-block" v-if="props.mapManager">
      <!-- Instantiate layer components here using v-for -->
      <LayerComponent
        v-for="layer in layers"
        v-bind:key="layer.name"
        v-bind:layer-name="layer.name"
        :getDefaultColor="layer.getStyle"
        @onColorChanged="onColorChanged"
        @onBorderStyleChanged="onBorderStyleChanged"
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
import { CommonEventManager } from "@/app/core/mapmanagers/CommonEventManager";
import { BorderStyle } from "@/app/core/tracks/Track2DSymmetric";
import Style from "ol/style/Style";

const props = defineProps<{
  mapManager?: ContactMapManager;
}>();

class LayerDescriptor {
  constructor(
    public name: string,
    public getStyle?: () => Style | undefined,
    public layer_manager?: unknown
  ) {}
}

const layers: Ref<LayerDescriptor[]> = ref([
  new LayerDescriptor("Contigs", () =>
    props.mapManager
      ?.getLayersManager()
      .track2DHolder.contigBordersTrack.getStyle()
  ),
  new LayerDescriptor("Scaffolds", () =>
    props.mapManager
      ?.getLayersManager()
      .track2DHolder.scaffoldBordersTrack.getStyle()
  ),
  new LayerDescriptor("Something"),
]);

function onColorChanged(layerName: string, newColor: string) {
  switch (layerName) {
    case "Contigs":
      getEventManager()?.onContigBorderColorChanged(newColor);
      break;
    case "Scaffolds":
      getEventManager()?.onScanffoldBorderColorChanged(newColor);
      break;
    default:
      alert(`Method for ${layerName} is undefined`);
      console.error(`Method for ${layerName} is undefined`);
  }

  // getEventManager()?.onContigBorderColorChanged(layerName, newColor);
  // getEventManager()[invoke](layerName, newColor);
}

function onBorderStyleChanged(layerName: string, style: BorderStyle) {
  switch (layerName) {
    case "Contigs":
      getEventManager()?.onContigBorderStyleChanged(style);
      break;
    case "Scaffolds":
      getEventManager()?.onScanffoldBorderStyleChanged(style);
      break;
    default:
      alert(`Method for ${layerName} is undefined`);
      console.error(`Method for ${layerName} is undefined`);
  }
}

function getEventManager(): CommonEventManager | undefined {
  return props.mapManager != undefined
    ? new CommonEventManager(props.mapManager)
    : undefined;
}
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
  /* background-color: green; */

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
  height: 200px;
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
