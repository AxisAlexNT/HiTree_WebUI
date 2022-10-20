<template>
  <div class="track-workspace">
    <TrackNames></TrackNames>
    <HorizontalIGVTrack></HorizontalIGVTrack>
  </div>
</template>

<script setup lang="ts">
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";
import HorizontalIGVTrack from "@/app/ui/components/tracks/HorizontalIGVTrack.vue";
import TrackNames from "@/app/ui/components/workspace/TrackNames.vue";

const props = defineProps<{
  mapManager: ContactMapManager | undefined;
  filename?: string;
}>();
</script>

<style scoped></style>
