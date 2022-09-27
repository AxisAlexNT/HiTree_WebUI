<template>
  <div class="upper-frame">
    <NavigationBar
      :networkManager="props.networkManager"
      @selected="onFileSelected"
    ></NavigationBar>
    <HeaderRibbon @reloadTiles="reloadTiles" @normalizationChanged="onNormalizationChanged"></HeaderRibbon>
  </div>
</template>

<script setup lang="ts">
import NavigationBar from "@/app/ui/components/upper_ribbon/NavigationBar.vue";
import HeaderRibbon from "@/app/ui/components/upper_ribbon/HeaderRibbon.vue";
import type { NetworkManager } from "@/app/core/net/NetworkManager.js";
import { NormalizationType } from "@/app/core/domain/common";
const emit = defineEmits<{
  (e: "selected", filename: string): void;
  (e: "reloadTiles"): void;
  (e: "normalizationChanged", normalizationType: NormalizationType): void;
}>();

const props = defineProps<{
  networkManager: NetworkManager;
}>();

function onFileSelected(filename: string): void {
  emit("selected", filename);
}

function reloadTiles(): void {
  emit("reloadTiles");
}

function onNormalizationChanged(normalizationType: NormalizationType){
  emit("normalizationChanged", normalizationType);
}
</script>

<style scoped>
.upper-frame {
  /* navbar&header */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;

  position: absolute;
  width: 1440px;
  height: 109px;
  left: 0px;
  top: 0px;
}
</style>
