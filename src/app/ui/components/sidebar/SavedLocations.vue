<template>
  <p class="w-100 m-0"><b>Saved Locations:</b></p>
  <div class="pills w-100">
    <div class="btn-group" role="group">
      <input
        id="saved-btn"
        autocomplete="off"
        checked
        class="btn-check"
        name="btnradio"
        type="radio"
      />
      <label class="btn btn-outline-primary" for="saved-btn">Saved</label>

      <input
        id="unplaced-btn"
        autocomplete="off"
        class="btn-check"
        name="btnradio"
        type="radio"
      />
      <label class="btn btn-outline-primary" for="unplaced-btn">Unplaced</label>
    </div>
  </div>

  <div class="save-btn-div">
    <button
      id="save-button"
      class="btn btn-outline-primary"
      type="button"
      data-bs-toggle="tooltip"
      data-bs-placement="bottom"
      title="Save current viewport"
      @click="saveLocation"
    >
      <i class="bi bi-bookmark-plus"></i>
      <span id="save-btn-text">Save</span>
    </button>
  </div>
  <div class="saved-locations-div">
    <div v-for="[id, loc] of savedLocations" :key="id">
      <SavedLocationElement
        v-if="loc"
        :map-manager="props.mapManager"
        :location_id="loc.location_id"
        :center_point="loc.center_point"
        :resolution="loc.resolution"
        :rotation="loc.rotation"
        @goto="gotoSavedLocation"
        @remove="removeSavedLocation"
      ></SavedLocationElement>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";
import SavedLocationElement from "./SavedLocationElement.vue";
import { Ref, ref } from "vue";
import { Coordinate } from "ol/coordinate";

const props = defineProps<{
  mapManager?: ContactMapManager;
}>();

const savedLocations: Ref<
  Map<
    number,
    {
      location_id: number;
      center_point: Coordinate | undefined;
      resolution: number | undefined;
      rotation: number | undefined;
    }
  >
> = ref(new Map());

const locationCount = ref(0);

function saveLocation() {
  const map = props.mapManager;
  const view = map?.getView();
  if (props.mapManager && map && view) {
    savedLocations.value.set(locationCount.value, {
      location_id: locationCount.value,
      center_point: view.getCenter(),
      resolution: view.getResolution(),
      rotation: view.getRotation(),
    });
    locationCount.value += 1;
  }
}

function gotoSavedLocation(location_id: number) {
  const map = props.mapManager;
  const view = map?.getView();
  const loc = savedLocations.value.get(location_id);
  if (loc && props.mapManager && map && view) {
    view.animate({
      center: loc.center_point,
      resolution: loc.resolution,
      rotation: loc.rotation,
    });
  }
}

function removeSavedLocation(location_id: number) {
  //savedLocations.value.splice(location_id, 1);
  // delete savedLocations.value[location_id];
  savedLocations.value.delete(location_id);
}
</script>

<style scoped>
.pills {
  /* pills */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  padding: 0px 16px;
  gap: 10px;

  /* width: 80%; */
  height: 40px;
}

.save-btn-div {
  /* save btn */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 16px 0px;

  width: 232px;
  height: 37px;

  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}

#save-button {
  /* Buttons */
  width: 232px;

  /* Inside auto layout */
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
}

#save-btn-text {
  margin-left: 10px;
}

.saved-locations-div {
  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  /* Inside auto layout */
  flex: none;
  order: 2;
  flex-grow: 0;

  height: 50%;
  max-height: 250px;
  overflow-y: scroll;
  overflow-x: hidden;
  width: 100%;
  padding-top: 15px;
  padding-right: 20px;
}
</style>
