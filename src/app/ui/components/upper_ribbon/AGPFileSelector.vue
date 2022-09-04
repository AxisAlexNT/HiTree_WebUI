<template>
  <div
    class="modal fade in"
    id="loadAGPModal"
    ref="loadAGPModal"
    tabindex="-1"
    data-keyboard="false"
    data-backdrop="static"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Select AGP file</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            @click="onDismissClicked"
          ></button>
        </div>
        <div class="modal-body">
          <div class="d-flex align-items-center" v-if="errorMessage">
            Error: {{ errorMessage }}
          </div>
          <div class="d-flex align-items-center" v-if="loading">
            <strong>Loading...</strong>
            <div class="spinner-border ms-auto" role="status"></div>
          </div>
          <div v-if="!loading">
            <select
              class="form-select form-select-lg mb-3"
              v-model="selectedAGPFilename"
            >
              <option selected>Select AGP file from the list below...</option>
              <option
                v-for="(filename, idx) in filenames"
                :key="idx"
                :value="filename"
              >
                {{ filename }}
              </option>
            </select>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              @click="onDismissClicked"
            >
              Dismiss
            </button>
            <button
              type="button"
              class="btn btn-primary"
              data-bs-dismiss="modal"
              @click="onSelectClicked"
            >
              Load AGP
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Ref, ref, onMounted } from "vue";
import { Modal } from "bootstrap";
import type { NetworkManager } from "@/app/core/net/NetworkManager.js";
import { LoadAGPRequest } from "@/app/core/net/api/request";

const emit = defineEmits<{
  (e: "selected", agpFilename: string): void;
  (e: "dismissed"): void;
}>();

const props = defineProps<{
  networkManager: NetworkManager;
}>();

const selectedAGPFilename: Ref<string | null> = ref(null);
const filenames: Ref<string[] | null> = ref(null);
const loading: Ref<boolean> = ref(true);
const errorMessage: Ref<any | null> = ref(null);
const modal: Ref<Modal | null> = ref(null);

const loadAGPModal = ref<HTMLElement | null>(null);

function getAGPFilenamesList(): void {
  props.networkManager.requestManager
    .listAGPFiles()
    .then((lst) => {
      filenames.value = lst;
      loading.value = false;
    })
    .catch((e) => {
      errorMessage.value = e;
      loading.value = false;
    });
}

function onDismissClicked(): void {
  modal.value?.dispose();
  modal.value = null;
  errorMessage.value = null;
  loading.value = false;
  filenames.value = null;
  selectedAGPFilename.value = null;
  emit("dismissed");
}

function onSelectClicked(): void {
  const selectedAGPFilenameString = selectedAGPFilename.value;
  if (!selectedAGPFilenameString) {
    throw new Error("Selected AGP filename was null?");
  }
  props.networkManager.requestManager
    .loadAGP(new LoadAGPRequest({ agpFilename: selectedAGPFilenameString }))
    .then(() => {
      emit("selected", selectedAGPFilenameString);
    })
    .catch((e) => {
      errorMessage.value = e;
    });
}

onMounted(() => {
  const fns = filenames.value;
  if (fns) {
    fns.length = 0;
  }
  loading.value = true;
  modal.value = new Modal(loadAGPModal.value ?? "loadAGPModal", {
    backdrop: "static",
    keyboard: false,
  });
  modal.value.show();
  getAGPFilenamesList();
});
</script>

<style scoped></style>
