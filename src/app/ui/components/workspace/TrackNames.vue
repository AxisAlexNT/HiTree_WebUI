<template>
  <div class="track-names">
    <figure class="text-center">
      <blockquote class="blockquote-sm">
        <p>{{ props.filename }}</p>
      </blockquote>
      <ul>
        <li
          v-for="track of props.trackManagers.map((t) => t.filename)"
          :key="track"
        >{{ track }}</li>
      </ul>
    </figure>
  </div>
</template>

<script setup lang="ts">
import { TrackManager } from "@/app/core/roulette/BedParser";

const props = defineProps<{
  filename: string;
  trackManagers: Array<TrackManager>;
}>();
</script>

<style scoped>
.track-names {
  width: 100%;
  height: 100%;
  border-bottom: solid 1px black;
  border-right: solid 1px black;
  margin-bottom: 15px;
  margin-right: 15px;
}
</style>
