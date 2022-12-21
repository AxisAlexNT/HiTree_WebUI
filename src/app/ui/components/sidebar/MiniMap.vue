<template>
  <div id="minimap-target-div"></div>
</template>

<script setup lang="ts">
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";
import { onMounted } from "vue";

const props = defineProps<{
  mapManager?: ContactMapManager;
}>();

onMounted(() => {
  //   const overviewMapTarget = document.getElementById("minimap-target-div");
  //   console.log("OverViewMapTarget: ", overviewMapTarget);
  //   if (overviewMapTarget) {
  //     props.mapManager?.addOverviewMapTarget(overviewMapTarget);
  //   }
});
</script>

<style scoped>
#minimap-target-div {
  width: 100%;
  height: 100%;
  /* background-color: aqua; */
}
</style>
