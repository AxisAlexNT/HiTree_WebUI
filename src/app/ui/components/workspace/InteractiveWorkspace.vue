<template>
  <div class="interactive-workspace">
    <div class="interactive-workspace_tracknames">1</div>
    <div class="interactive-workspace_horizontal">2</div>
    <div class="interactive-workspace_vertical">3</div>
    <div class="interactive-workspace_content">
      <div class="test"></div>
    </div>
    <!-- <TrackWorkspace
      :map-manager="props.mapManager"
      :filename="props.filename"
    ></TrackWorkspace>
    <ContactMapWorkspace
      :map-manager="props.mapManager"
      :filename="props.filename"
    ></ContactMapWorkspace> -->
  </div>
</template>

<script setup lang="ts">
import {
  ContactMapManager,
  // type ContactMapManagerOptions,
} from "@/app/core/mapmanagers/ContactMapManager";
import TrackWorkspace from "@/app/ui/components/workspace/TrackWorkspace.vue";
import ContactMapWorkspace from "@/app/ui/components/workspace/ContactMapWorkspace.vue";

const props = defineProps<{
  mapManager: ContactMapManager | undefined;
  filename?: string;
}>();
</script>

<style scoped>
.interactive-workspace {
  width: 100%;
  display: grid;
  grid-template-rows: 100px 1fr;
  grid-template-columns: 100px 1fr;
  grid-template-areas:
    "tracknames horizontal"
    "vertical content";
}

.interactive-workspace_tracknames {
  grid-area: tracknames;
  background-color: red;
}
.interactive-workspace_horizontal {
  grid-area: horizontal;
  background-color: green;
}
.interactive-workspace_vertical {
  grid-area: vertical;
  background-color: yellow;
}
.interactive-workspace_content {
  grid-area: content;
  background-color: magenta;
}

.test {
  width: 100%;
  height: 100%;

  background-color: black;
}
</style>
