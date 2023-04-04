<template>
  <div class="d-flex align-items-center" v-if="errorMessage">
    <p class="error-message">Error: {{ errorMessage }}</p>
  </div>
  <div class="d-flex align-items-center" v-if="loading">
    <strong>Loading...</strong>
    <div class="spinner-border ms-auto" role="status"></div>
  </div>
  <div v-if="!loading">
    <select
      class="form-select form-select-lg mb-3"
      v-model="selectedCoolerFilename"
    >
      <option selected>Select Cooler file from the list below...</option>
      <option v-for="(filename, idx) in filenames" :key="idx" :value="filename">
        {{ filename }}
      </option>
    </select>
  </div>
  <div>
    <button
      type="button"
      class="btn btn-primary"
      v-if="selectedCoolerFilename"
      @click="onSelectClicked"
    >
      Next
    </button>
  </div>
</template>
ASTAFilesRequest
<script setup lang="ts">
import { type Ref, ref, onMounted } from "vue";
import type { NetworkManager } from "@/app/core/net/NetworkManager.js";

const emit = defineEmits<{
  (e: "selected", coolerFilename: string): void;
}>();

const props = defineProps<{
  networkManager: NetworkManager;
}>();

const selectedCoolerFilename: Ref<string | null> = ref(null);
const filenames: Ref<string[]> = ref([]);
const loading: Ref<boolean> = ref(true);
const errorMessage: Ref<unknown | null> = ref(null);

function onSelectClicked(): void {
  if (selectedCoolerFilename.value) {
    emit("selected", selectedCoolerFilename.value);
  }
}

onMounted(() => {
  props.networkManager.requestManager
    .listCoolers()
    .then((lst) => {
      filenames.value = lst;
    })
    .catch((e) => {
      errorMessage.value = e;
    })
    .finally(() => {
      loading.value = false;
    });
});
</script>

<style scoped>
.error-message {
  color: red;
}
</style>
