<template>
  <div class="workspace-component">
    <ToolBar :mapManager="props.mapManager"></ToolBar>
    <InteractiveWorkspace
      :map-manager="props.mapManager"
      :filename="filename"
    ></InteractiveWorkspace>
    <SideBar :mapManager="props.mapManager"></SideBar>
  </div>
</template>

<script setup lang="ts">
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";
import InteractiveWorkspace from "@/app/ui/components/workspace/InteractiveWorkspace.vue";
import ToolBar from "@/app/ui/components/toolbar/ToolBar.vue";
import SideBar from "@/app/ui/components/sidebar/SideBar.vue";

const props = defineProps<{
  mapManager: ContactMapManager | undefined;
  filename?: string;
}>();
</script>

<style scoped>
.workspace-component {
  display: flex;
  /* background-color: orange; */
  height: calc(100% - 109px);
}
</style>
