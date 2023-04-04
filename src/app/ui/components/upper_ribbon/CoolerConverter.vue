<template>
  <div
    class="modal fade in"
    id="loadAGPModal"
    ref="convertCoolerModal"
    tabindex="-1"
    data-keyboard="false"
    data-backdrop="static"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Convert Coolers for HiCT</h5>
          <button
            type="button"
            class="btn-close"
            @click="onDismissClicked"
          ></button>
        </div>
        <div class="modal-body">
          <div class="d-flex align-items-center" v-if="errorMessage">
            <p class="error-message">Error: {{ errorMessage }}</p>
          </div>
          <div v-if="!loading">
            <select
              class="form-select form-select-lg mb-3"
              v-model="selectedCoolerFilename"
            >
              <option selected>
                Select Cooler file from the list below...
              </option>
              <option
                v-for="(filename, idx) in filenames"
                :key="idx"
                :value="filename"
              >
                {{ filename }}
              </option>
            </select>
          </div>
          <CoolerFileSelector
            v-if="!selectedCoolerFilename"
            :network-manager="networkManager"
            @selected="onCoolerFileSelected"
          />
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="onDismissClicked"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Ref, ref, onMounted } from "vue";
import { Modal } from "bootstrap";
import type { NetworkManager } from "@/app/core/net/NetworkManager.js";
import { ConvertCoolerRequest } from "@/app/core/net/api/request";
import CoolerFileSelector from "./converter/CoolerFileSelector.vue";

const emit = defineEmits<{
  (e: "dismissed"): void;
}>();

const props = defineProps<{
  networkManager: NetworkManager;
}>();

const selectedCoolerFilename: Ref<string | null> = ref(null);
const filenames: Ref<string[] | null> = ref(null);
const loading: Ref<boolean> = ref(true);
const errorMessage: Ref<unknown | null> = ref(null);
const modal: Ref<Modal | null> = ref(null);
const convertCoolerModal = ref<HTMLElement | null>(null);

function resetState(): void {
  try {
    modal.value?.dispose();
  } catch (e: unknown) {
    // Expected
  } finally {
    modal.value = null;
    errorMessage.value = null;
    loading.value = false;
    filenames.value = null;
    selectedCoolerFilename.value = null;
  }
}

function onDismissClicked(): void {
  resetState();
  emit("dismissed");
}

function onCoolerFileSelected(coolerFilename: string): void {
  selectedCoolerFilename.value = coolerFilename;
  convertCooler();
}

function convertCooler(): void {
  const filename = selectedCoolerFilename.value;
  if (filename) {
    loading.value = true;
    props.networkManager.requestManager
      .convertCooler(
        new ConvertCoolerRequest({
          cooler_filename: filename,
        })
      )
      .catch((e) => {
        loading.value = false;
        errorMessage.value = e;
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

onMounted(() => {
  const fns = filenames.value;
  if (fns) {
    fns.length = 0;
  }
  loading.value = true;
  modal.value = new Modal(convertCoolerModal.value ?? "loadAGPModal", {
    backdrop: "static",
    keyboard: false,
  });
  modal.value.show();
});
</script>

<style scoped></style>
