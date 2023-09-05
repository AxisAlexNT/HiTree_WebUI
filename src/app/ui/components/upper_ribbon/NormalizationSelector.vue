<template>
  <div
    class="dropdown dropdown-sm"
    id="normalization-settings-dropdown"
    data-bs-auto-close="false"
  >
    <button
      class="btn btn-sm btn-light dropdown-toggle"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      Normalization settings
    </button>
    <ul id="normalization-dropdown-menu" class="dropdown-menu p-3">
      <li>
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            value=""
            id="checkbox-normalization-pre-log"
            v-model="applyPreLog"
          />
          <label class="form-check-label" for="checkbox-normalization-pre-log">
            Apply pre log-normalization
          </label>
        </div>
      </li>
      <li v-if="applyPreLog">
        <div>
          <label for="normalization-pre-log-base"> Logarithm base: </label>
          <input
            class="form-check-input number-input"
            type="number"
            id="normalization-pre-log-base"
            min="2.0"
            max="1000.0"
            step="0.5"
            v-model.number="preLogBase"
          />
        </div>
      </li>
      <li><hr class="dropdown-divider" /></li>
      <li>
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            value=""
            id="checkbox-normalization-cooler-weigths"
            v-model="applyCoolerWeights"
          />
          <label
            class="form-check-label"
            for="checkbox-normalization-cooler-weights"
          >
            Apply weights from Cooler
          </label>
        </div>
      </li>
      <li><hr class="dropdown-divider" /></li>
      <li>
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            value=""
            id="checkbox-normalization-post-log"
            v-model="applyPostLog"
          />
          <label class="form-check-label" for="checkbox-normalization-post-log">
            Apply post log-normalization
          </label>
        </div>
      </li>
      <li v-if="applyPostLog">
        <div>
          <label for="normalization-post-log-base"> Logarithm base: </label>
          <input
            class="form-check-input number-input"
            type="number"
            id="normalization-post-log-base"
            min="2.0"
            max="1000.0"
            step="0.5"
            v-model.number="postLogBase"
          />
        </div>
      </li>
      <li><hr class="dropdown-divider" /></li>
      <li>
        <div class="btn-group" role="group" id="normalization-apply-group">
          <button type="button" class="btn btn-success" @click="applySettings">
            Apply
          </button>
          <button type="button" class="btn btn-danger" @click="resetAttributes">
            Reset
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";
import { Ref, ref } from "vue";
import { useVisualizationOptionsStore } from "@/app/stores/visualizationOptionsStore";
import { storeToRefs } from "pinia";
const visualizationOptionsStore = useVisualizationOptionsStore();
const { preLogBase, applyCoolerWeights, postLogBase, colormap } = storeToRefs(
  visualizationOptionsStore
);

const props = defineProps<{
  mapManager?: ContactMapManager;
}>();

const applyPreLog: Ref<boolean> = ref(false);

// const applyCoolerWeights: Ref<boolean> = ref(false);

const applyPostLog: Ref<boolean> = ref(true);

// const preLogBase: Ref<number> = ref(10);

// const postLogBase: Ref<number> = ref(10);

function resetAttributes(): void {
  applyPreLog.value = false;
  preLogBase.value = 10;
  applyPostLog.value = true;
  postLogBase.value = 10;
  applyCoolerWeights.value = false;
}

function applySettings(): void {
  // props.mapManager?.eventManager.onNormalizationChanged({
  //   applyCoolerWeights: applyCoolerWeights.value,
  //   preLogBase: applyPreLog.value ? preLogBase.value : -1,
  //   postLogBase: applyPostLog.value ? postLogBase.value : -1,
  // });
  props.mapManager?.visualizationManager
    .sendVisualizationOptionsToServer()
    .then(() => props.mapManager?.reloadTiles());
}
</script>

<style scoped>
#normalization-dropdown-menu {
  white-space: nowrap;
}

.number-input {
  width: 100px;
  float: right;
}

#normalization-apply-group {
  width: 100%;
}
</style>
