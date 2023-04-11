<template>
  <div class="interactive-workspace">
    <div class="interactive-workspace_tracknames">
      <TrackNames></TrackNames>
    </div>
    <div class="interactive-workspace_horizontal">
      <HorizontalIGVTrack :map-manager="props.mapManager"></HorizontalIGVTrack>
    </div>
    <div class="interactive-workspace_vertical">
      <VerticalIGVTrack :map-manager="props.mapManager"></VerticalIGVTrack>
    </div>
    <div class="interactive-workspace_content">
      <ContactMap></ContactMap>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ContactMapManager,
  // type ContactMapManagerOptions,
} from "@/app/core/mapmanagers/ContactMapManager";
import TrackNames from "./TrackNames.vue";
import HorizontalIGVTrack from "../tracks/HorizontalIGVTrack.vue";
import ContactMap from "../../contactmap/ContactMap.vue";
import VerticalIGVTrack from "../tracks/VerticalIGVTrack.vue";

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

/*
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
*/

.test {
  width: 100%;
  height: 100%;

  background-color: black;
}
</style>
