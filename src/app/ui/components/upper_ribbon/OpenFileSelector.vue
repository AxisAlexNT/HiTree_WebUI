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
            data-bs-dismiss="modal"
            @click="$emit('dismissed')"
          ></button>
        </div>
        <div class="modal-body">
          <div class="d-flex align-items-center" v-if="loading">
            <strong>Loading...</strong>
            <div class="spinner-border ms-auto" role="status"></div>
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
              data-bs-dismiss="modal"
              @click="$emit('dismissed')"
            >
              Dismiss
            </button>
            <button
              type="button"
              class="btn btn-primary"
              data-bs-dismiss="modal"
              @click="$emit('selected', selected_filename)"
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

const openFileModal = ref<HTMLElement | null>(null);

onMounted(() => {
  filenames.value.length = 0;
  loading.value = true;
  const modal = new Modal(openFileModal.value ?? "openFileModal", {
    backdrop: "static",
    keyboard: false,
  });
  modal.show();
  props.networkManager.requestManager
    .listFiles()
    .then((lst) => {
      filenames.value = lst;
      loading.value = false;
    })
    .catch((e) => {
      loading.value = false;
      alert(e);
      emit("selected", "");
      modal.hide();
    });
});
</script>

<style scoped></style>
