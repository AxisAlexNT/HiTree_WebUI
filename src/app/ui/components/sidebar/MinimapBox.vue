<template>
  <div id="minimap" class="map"></div>
</template>

<script setup lang="ts">
import Map from "ol/Map.js";
import OSM from "ol/source/OSM.js";
import TileLayer from "ol/layer/Tile.js";
import View from "ol/View.js";
import {
  DragRotateAndZoom,
  defaults as defaultInteractions
} from "ol/interaction.js";
import { OverviewMap, defaults as defaultControls } from "ol/control.js";
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";
import { onMounted } from "vue";

const props = defineProps<{
  mapManager: ContactMapManager | undefined;
}>();


const overviewMapControl = new OverviewMap({
  target: "minimap", //document.getElementById("minimap") as HTMLElement,
  collapsible: false,
  // view: props.mapManager?.getView(),
  view: new View({
    center: [0, 0],
    zoom: -100,
  }),
  layers: props.mapManager?.viewAndLayersManager?.layersHolder.hicDataLayers
});

onMounted(() => {
  props.mapManager?.getMap()?.addControl(overviewMapControl);
});

</script>

<style scoped>
.map {
  width: 100%;
  height: 400px;
}

.map .ol-custom-overviewmap,
.map .ol-custom-overviewmap.ol-uncollapsible {
  bottom: auto;
  left: auto;
  right: 0;
  top: 0;
}

.map .ol-custom-overviewmap:not(.ol-collapsed) {
  border: 1px solid black;
}

.map .ol-custom-overviewmap .ol-overviewmap-map {
  border: none;
  width: 300px;
}

.map .ol-custom-overviewmap .ol-overviewmap-box {
  border: 2px solid red;
}

.map .ol-custom-overviewmap:not(.ol-collapsed) button {
  bottom: auto;
  left: auto;
  right: 1px;
  top: 1px;
}

.map .ol-rotate {
  top: 170px;
  right: 0;
}
</style>