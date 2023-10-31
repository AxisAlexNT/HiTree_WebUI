<template>
  <div class="minimap-target-div" ref="miniMap"></div>
</template>

<script setup lang="ts">
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";
import { usehtmlElementReferencesStore } from "@/app/stores/htmlElementReferencesStore";
import { View } from "ol";
import { storeToRefs } from "pinia";
import { Ref, onMounted, ref, watch } from "vue";
import { OverviewMap } from "ol/control";

const htmlElementReferencesStore = usehtmlElementReferencesStore();

const { mapTarget, miniMapTarget } = storeToRefs(htmlElementReferencesStore);

const miniMap: Ref<HTMLElement | null> = ref(null);

watch(
  () => miniMap.value,
  () => (mapTarget.value = miniMap.value)
);

const props = defineProps<{
  mapManager?: ContactMapManager;
}>();

onMounted(() => {
  const minimapElement = miniMap.value;
  if (minimapElement) {
    console.log("minimapElement value", miniMap.value);
    const mapManager = props.mapManager;
    if (mapManager) {
      const map = mapManager.getMap();
      const minimap = new OverviewMap({
        collapsed: false,
        collapsible: false,
        rotateWithView: false,
        target: minimapElement,
        className: "ol-overviewmap",
        view: new View({
          maxZoom: 1,
          center: map.getView().getCenter(),
          enableRotation: false,
          projection: map.getView().getProjection(),
          showFullExtent: true,
        }),
        layers: [mapManager.viewAndLayersManager.layersHolder.hicDataLayers[0]],
      });
      map.addControl(minimap);
      // minimap.setMap(map);
      mapManager.minimap = minimap;
    } else {
      console.log("No map manager to set minimap target");
    }
  } else {
    console.log("No minimap target");
  }
  //   const custom-overviewmapTarget = document.getElementById("minimap-target-div");
  //   console.log("Custom-overviewmapTarget: ", custom-overviewmapTarget);
  //   if (custom-overviewmapTarget) {
  //     props.mapManager?.addCustom-overviewmapTarget(custom-overviewmapTarget);
  //   }
});
</script>

<style scoped>
.minimap-target-div {
  width: 100%;
  height: 100%;
  /* background-color: aqua; */
  position: relative;
}


</style>
