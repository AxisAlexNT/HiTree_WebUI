<template>
  <div class="contact-map-workspace">
    <VerticalIGVTrack></VerticalIGVTrack>
    <ContactMap :filename="filename" :manager="mapManager"></ContactMap>
  </div>
</template>

<script setup lang="ts">
import ContactMap from "@/app/ui/contactmap/ContactMap.vue";

import {
  ContactMapManager,
  // type ContactMapManagerOptions,
} from "@/app/core/mapmanagers/ContactMapManager";
import VerticalIGVTrack from "@/app/ui/components/tracks/VerticalIGVTrack.vue";

const props = defineProps<{
  mapManager: ContactMapManager | undefined;
  filename?: string;
}>();
</script>

<style scoped></style>
