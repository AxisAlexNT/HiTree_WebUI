<template>
  <div
    class="modal fade in"
    id="openFASTAModal"
    ref="openFASTAModal"
    tabindex="-1"
    data-keyboard="false"
    data-backdrop="static"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Select FASTA file</h5>
          <button
            type="button"
            class="btn-close"
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
              v-model="selectedFASTAFilename"
            >
              <option selected>Select FASTA file from the list below...</option>
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
              @click="onDismissClicked"
            >
              Dismiss
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="onSelectClicked"
            >
              Link FASTA
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
import { LinkFASTARequest } from "@/app/core/net/api/request";

const emit = defineEmits<{
  (e: "selected", fastaFilename: string): void;
  (e: "dismissed"): void;
}>();

const props = defineProps<{
  networkManager: NetworkManager;
}>();

const selectedFASTAFilename: Ref<string | null> = ref(null);
const filenames: Ref<string[] | null> = ref(null);
const loading: Ref<boolean> = ref(true);
const errorMessage: Ref<unknown | null> = ref(null);
const modal: Ref<Modal | null> = ref(null);

const openFASTAModal = ref<HTMLElement | null>(null);

function getFASTAFilenamesList(): void {
  loading.value = true;
  props.networkManager.requestManager
    .listFASTAFiles()
    .then((lst) => {
      filenames.value = lst;
    })
    .catch((e) => {
      errorMessage.value = e;
    })
    .finally(() => {
      loading.value = false;
    });
}

function resetState(): void {
  modal.value?.dispose();
  modal.value = null;
  errorMessage.value = null;
  loading.value = false;
  filenames.value = null;
  selectedFASTAFilename.value = null;
}

function onDismissClicked(): void {
  emit("dismissed");
  resetState();
}

function onSelectClicked(): void {
  const selectedFASTAFilenameString = selectedFASTAFilename.value;
  if (!selectedFASTAFilenameString) {
    // throw new Error("Selected FASTA filename was null?");
    errorMessage.value = "Please, select valid FASTA file";
    return;
  }
  props.networkManager.requestManager
    .linkFASTA(
      new LinkFASTARequest({ fastaFilename: selectedFASTAFilenameString })
    )
    .then(() => {
      emit("selected", selectedFASTAFilenameString);
      resetState();
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
  modal.value = new Modal(openFASTAModal.value ?? "openFASTAModal", {
    backdrop: "static",
    keyboard: false,
  });
  modal.value.show();
  getFASTAFilenamesList();
});
</script>

<style scoped></style>
