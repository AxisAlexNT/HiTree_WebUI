<template>
  <div class="interactive-workspace">
    <TrackWorkspace :map-manager="props.mapManager" :filename="props.filename"></TrackWorkspace>
    <ContactMapWorkspace :map-manager="props.mapManager" :filename="props.filename"></ContactMapWorkspace>
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
  height: 100%;
  background-color: red;
}
</style>
