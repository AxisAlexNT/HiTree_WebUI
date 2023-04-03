<template>
  <div
    class="modal fade in"
    id="openFileModal"
    ref="openFileModal"
    tabindex="-1"
    data-keyboard="false"
    data-backdrop="static"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Select file to be opened</h5>
          <button
            type="button"
            class="btn-close"
            @click="onDismissClicked"
          ></button>
        </div>
        <div class="modal-body">
          <div class="d-flex align-items-center" v-if="loading">
            <strong>Loading...</strong>
            <div class="spinner-border ms-auto" role="status"></div>
          </div>
          <div class="d-flex align-items-center" v-if="errorMessage">
            Error: {{ errorMessage }}
          </div>
          <div v-if="!loading">
            <select
              class="form-select form-select-lg mb-3"
              v-model="selected_filename"
            >
              <option selected>Select file from the list below...</option>
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
              Open
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

const emit = defineEmits<{
  (e: "selected", filename: string): void;
  (e: "dismissed"): void;
}>();

const props = defineProps<{
  networkManager: NetworkManager;
}>();

const selected_filename: Ref<string> = ref("");
const filenames: Ref<string[]> = ref([]);
const loading: Ref<boolean> = ref(true);
const modal: Ref<Modal | null> = ref(null);
const openFileModal = ref<HTMLElement | null>(null);
const errorMessage: Ref<unknown | null> = ref(null);

function resetState(): void {
  try {
    modal.value?.dispose();
  } catch (e: unknown) {
    // Expected
  } finally {
    modal.value = null;
    loading.value = false;
    filenames.value.length = 0;
    selected_filename.value = "";
  }
}

function onDismissClicked(): void {
  resetState();
  emit("dismissed");
}

function onSelectClicked(): void {
  const selectedFilename = selected_filename.value;
  if (!selectedFilename) {
    onDismissClicked();
    throw new Error("Selected filename was null?");
  }
  emit("selected", selectedFilename);
  resetState();
}

onMounted(() => {
  filenames.value.length = 0;
  loading.value = true;
  modal.value = new Modal(openFileModal.value ?? "openFileModal", {
    backdrop: "static",
    keyboard: false,
  });
  modal.value.show();
  props.networkManager.requestManager
    .listFiles()
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

<style scoped></style>
