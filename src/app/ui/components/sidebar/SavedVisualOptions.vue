<template>
  <p class="w-100 m-0"><b>Visualization presets:</b></p>
  <div
    class="btn-group w-100 p-2"
    role="group"
    aria-label="Visualization presets"
  >
    <button
      type="button"
      class="btn btn-outline-primary"
      data-bs-toggle="tooltip"
      data-bs-placement="bottom"
      title="Save current visualization options"
      @click="saveOptions"
    >
      <i class="bi bi-bookmark-plus"></i> Save
    </button>
    <button
      type="button"
      class="btn btn-outline-primary"
      @click="exportOptions"
    >
      Export
    </button>
    <button
      type="button"
      class="btn btn-outline-primary"
      @click="importFileBtn?.click()"
    >
      Import
      <input
        type="file"
        ref="importFileBtn"
        v-on:change="importOptionsFromFile()"
        hidden
      />
    </button>
  </div>
  <div class="saved-locations-div">
    <div v-for="[id, opt] of savedOptions" :key="id">
      <SavedVisualOptionsElement
        v-if="opt"
        :map-manager="props.mapManager"
        :option_id="opt.option_id"
        :visualization-options="opt.options"
        @remove="removeSavedLocation"
      ></SavedVisualOptionsElement>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";
import { Ref, ref } from "vue";
import { Coordinate } from "ol/coordinate";
import SavedVisualOptionsElement from "./SavedVisualOptionsElement.vue";
import VisualizationOptions from "@/app/core/visualization/VisualizationOptions";
import { useVisualizationOptionsStore } from "@/app/stores/visualizationOptionsStore";
import { storeToRefs } from "pinia";
import { toast } from "vue-sonner";
import { read } from "fs";
const visualizationOptionsStore = useVisualizationOptionsStore();
const { preLogBase, applyCoolerWeights, postLogBase, colormap } = storeToRefs(
  visualizationOptionsStore
);

const props = defineProps<{
  mapManager?: ContactMapManager;
}>();

const savedOptions: Ref<
  Map<
    number,
    {
      option_id: number;
      options: VisualizationOptions;
    }
  >
> = ref(new Map());

const importFileBtn: Ref<HTMLElement | null> = ref(null);

const optionsCount = ref(0);

function saveOptions() {
  if (props.mapManager) {
    savedOptions.value.set(optionsCount.value, {
      option_id: optionsCount.value,
      options: visualizationOptionsStore.asVisualizationOptions(),
    });
    optionsCount.value += 1;
  }
}

function removeSavedLocation(option_id: number) {
  //savedLocations.value.splice(location_id, 1);
  // delete savedLocations.value[location_id];
  savedOptions.value.delete(option_id);
}

function exportOptions() {
  const values: {
    option_id: number;
    options: VisualizationOptions;
  }[] = [];

  savedOptions.value.forEach((v) => values.push(v));

  const data = JSON.stringify({
    exportType: "visualizationOptions",
    data: {
      savedLocations: values,
    },
  });
  const blob = new Blob([data], { type: "text/plain" });
  const e = document.createEvent("MouseEvents"),
    a = document.createElement("a");
  a.download = "visualizationOptionsPresets.hict.json";
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
  e.initEvent(
    "click",
    true,
    false,
    window,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null
  );
  a.dispatchEvent(e);
}

function importOptionsFromFile() {
  try {
    if (importFileBtn.value) {
      const fileList = importFileBtn.value.files as FileList;
      if (fileList && fileList.length > 0) {
        const reader = new FileReader();
        reader.readAsText(fileList[0], "utf-8");
        console.log(fileList);
        console.log(reader);
        reader.onload = (evt) => {
          try {
            if (!evt.target || !evt.target.result) {
              return;
            }
            const jsonResult = JSON.parse(evt.target.result as string) as {
              exportType: "visualizationOptions";
              data: {
                savedLocations: {
                  option_id: number;
                  options: VisualizationOptions;
                }[];
              };
            };
            console.log(jsonResult);
            jsonResult.data.savedLocations.forEach((option) => {
              if (savedOptions.value.has(option.option_id)) {
                const newOption = {
                  option_id: 1 + Math.max(...savedOptions.value.keys()),
                  options: option.options,
                };
                savedOptions.value.set(newOption.option_id, newOption);
                optionsCount.value = 1 + newOption.option_id;
              } else {
                savedOptions.value.set(option.option_id, option);
                optionsCount.value = Math.max(
                  optionsCount.value,
                  1 + option.option_id
                );
              }
            });
          } catch (e) {
            toast.error("Cannot import visualization options: " + e);
          }
        };
      }
    }
  } catch (e) {
    toast.error("Cannot import visualization options: " + e);
  }
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
