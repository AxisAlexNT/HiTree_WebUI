<template>
  <div class="saved-locations">
    <div class="input-group">
      <input
        type="text"
        class="form-control m-0"
        placeholder="Location name"
        aria-label="Name of the saved location"
        v-model="name"
      />
      <button
        class="btn btn-outline-primary"
        type="button"
        title="Go to saved location"
        @click="$emit('goto', props.location_id)"
      >
        <i class="bi bi-box-arrow-in-right"></i>
      </button>
      <button
        class="btn btn-outline-danger"
        type="button"
        title="Remove saved location"
        @click="$emit('remove', props.location_id)"
      >
        <i class="bi bi-x-square-fill"></i>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";
import { Coordinate } from "ol/coordinate";
import { ref } from "vue";

const props = defineProps<{
  mapManager?: ContactMapManager;
  location_id: number;
  center_point: Coordinate | undefined;
  resolution: number | undefined;
  rotation: number | undefined;
}>();

const emits = defineEmits<{
  (e: "goto", location_id: number): void;
  (e: "remove", location_id: number): void;
}>();

const name = ref(props.location_id + " unnamed location");
</script>
<style scoped>
.saved-locations {
  /* layer */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0px;
  /* gap: 20px; */

  width: 100%;
  height: 40px;
  margin-left: 10px;
  margin-right: 10px;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}
</style>
