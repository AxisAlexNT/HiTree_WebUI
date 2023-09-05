<template>
  <div id="gradient-editor-div">
    <div class="gradient-btn-div">
      <button
        id="gradient-button"
        class="btn btn-outline-primary"
        type="button"
        data-bs-toggle="tooltip"
        data-bs-placement="bottom"
        title="Edit heatmap colors"
        @click="editCurves"
      >
        <i class="bi bi-palette"></i>
        <i class="bi bi-brush-fill"></i>
        <span id="gradient-btn-text">Edit heatmap colors</span>
      </button>
    </div>
  </div>

  <div
    class="modal fade in"
    id="gradientEditorModal"
    ref="gradientEditorModal"
    tabindex="-1"
    data-keyboard="false"
    data-backdrop="static"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit heatmap gradient</h5>
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
          <div>
            <div id="gradsample" :style="gradstyle"></div>
            <div>
              <p>Start color:</p>
              <ColorPickerRectangle
                :getDefaultColor="() => fromColor"
                @onColorChanged="(nc: string) => (fromColor = nc)"
              >
              </ColorPickerRectangle>
            </div>
            <div>
              <p>End color:</p>
              <ColorPickerRectangle
                :getDefaultColor="() => toColor"
                @onColorChanged="(nc: string) => (toColor = nc)"
              >
              </ColorPickerRectangle>
            </div>
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
              Apply gradient
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "toolcool-color-picker";
import ColorPickerRectangle from "./ColorPickerRectangle.vue";
import { type Ref, ref, onMounted, watch } from "vue";
import { Modal } from "bootstrap";
import type { NetworkManager } from "@/app/core/net/NetworkManager.js";
import { toast } from "vue-sonner";

const emit = defineEmits<{
  (e: "dismissed"): void;
}>();

const props = defineProps<{
  networkManager: NetworkManager;
}>();

const fromColor = ref("rgba(0,255,0,0)");
const toColor = ref("rgba(0,96,0,255");

const gradstyle = ref({
  width: "100%",
  height: "2rem",
  "background-image":
    "linear-gradient(to right," + fromColor.value + " , " + toColor.value + ")",
});

function getDefaultColor() {
  return fromColor.value;
}

watch(
  () => [fromColor.value, toColor.value],
  () => {
    gradstyle.value["background-image"] =
      "linear-gradient(to right," +
      fromColor.value +
      " , " +
      toColor.value +
      ")";
  }
);

const modal: Ref<Modal | null> = ref(null);
const gradientEditorModal = ref<HTMLElement | null>(null);
const errorMessage: Ref<unknown | null> = ref(null);

function resetState(): void {
  try {
    modal.value?.hide();
    // modal.value?.dispose();
  } catch (e: unknown) {
    // Expected
  } finally {
    modal.value = null;
  }
}

function onDismissClicked(): void {
  resetState();
  emit("dismissed");
}

function onSelectClicked(): void {
  alert("Selected");
  resetState();
}

function editCurves() {
  modal.value = new Modal(gradientEditorModal.value ?? "gradientEditorModal", {
    backdrop: "static",
    keyboard: false,
  });
  modal.value.show();
}
</script>

<style scoped>
#gradient-editor-div {
  margin-top: 5px;
  margin-bottom: 5px;
  margin-left: 0px;
  margin-right: 0px;
  width: 100%;
  text-align: left;
  /* height: 200px; */
}
</style>
