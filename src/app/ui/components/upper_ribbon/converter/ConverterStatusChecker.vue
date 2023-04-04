<template>
  <div class="d-flex align-items-center" v-if="errorMessage">
    <p class="error-message">Error: {{ errorMessage }}</p>
  </div>
  <div class="d-flex align-items-center" v-if="loading">
    <div v-if="converterStatus && converterStatus.isConverting">
      <div class="spinner-border ms-auto" role="status"></div>
      <p><strong>Converting...</strong></p>
      <p>The status is updated automatically. Please, wait.</p>
    </div>
    <div v-if="converterStatus && !converterStatus.isConverting">
      <p><strong>Conversion finished!</strong></p>
      <p>Please, click "Next" to continue.</p>
    </div>
    <div class="progress-wrapper">
      <div class="some-progress">
        <p>
          Progress in current resolution:
          {{
            String(
              Math.round(100 * (converterStatus?.resolutionProgress ?? 0))
            ) + "%"
          }}
        </p>
        <div class="progress hict-progress">
          <div
            class="progress-bar bg-info"
            role="progressbar"
            :style="{
              width:
                String(
                  Math.round(100 * (converterStatus?.resolutionProgress ?? 0))
                ) + '%',
            }"
            aria-valuenow="{{ Math.round(100 * (converterStatus?.resolutionProgress ?? 0)) }}"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>
      <div class="some-progress">
        <p>
          Total progress:
          {{
            String(Math.round(100 * (converterStatus?.totalProgress ?? 0))) +
            "%"
          }}
        </p>
        <div class="progress hict-progress">
          <div
            class="progress-bar bg-success"
            role="progressbar"
            :style="{
              width:
                String(
                  Math.round(100 * (converterStatus?.totalProgress ?? 0))
                ) + '%',
            }"
            aria-valuenow="{{ Math.round(100 * (converterStatus?.totalProgress ?? 0)) }}"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>
    </div>
  </div>
  <div>
    <button
      type="button"
      class="btn btn-primary"
      v-if="converterStatus && !converterStatus.isConverting"
      @click="onNextClicked"
    >
      Next
    </button>
  </div>
</template>

<script setup lang="ts">
import { type Ref, ref, onMounted } from "vue";
import type { NetworkManager } from "@/app/core/net/NetworkManager.js";
import { ConverterStatusResponse } from "@/app/core/net/api/response";

const props = defineProps<{
  networkManager: NetworkManager;
}>();

const emit = defineEmits<{
  (e: "finished"): void;
}>();

const loading: Ref<boolean> = ref(true);
const converterStatus: Ref<ConverterStatusResponse | undefined> =
  ref(undefined);
const errorMessage: Ref<unknown | undefined> = ref(undefined);
const timerId: Ref<string | number | undefined> = ref(undefined);
const missedRequestCount: Ref<number> = ref(0);
const MISSED_THRESHOLD = 10;

function resetState(): void {
  if (timerId.value) {
    clearInterval(timerId.value);
    timerId.value = undefined;
  }
  loading.value = true;
  converterStatus.value = undefined;
  errorMessage.value = null;
  missedRequestCount.value = 0;
}

function onNextClicked(): void {
  emit("finished");
  resetState();
}

function updateState(): void {
  props.networkManager.requestManager
    .getConverterStatus()
    .then((resp) => {
      missedRequestCount.value = 0;
      converterStatus.value = resp;
      if (!resp.isConverting) {
        if (timerId.value) {
          clearInterval(timerId.value);
          timerId.value = undefined;
        }
      }
    })
    .catch((err) => {
      if (err.code === "ECONNABORTED") {
        missedRequestCount.value++;
        if (missedRequestCount.value > MISSED_THRESHOLD) {
          errorMessage.value =
            "More than " +
            String(MISSED_THRESHOLD) +
            " status checks were timed out. Probably, converter has failed.";
        }
      } else {
        errorMessage.value = err;
      }
    });
}

onMounted(() => {
  // @ts-expect-error "Using default JS-style timer instead of NodeJS"
  timerId.value = setInterval(updateState, 5000);
});
</script>

<style scoped>
.error-message {
  color: red;
}

.progress-wrapper {
  width: 100%;
}
.some-progress {
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
}

.hict-progress {
  width: 100%;
}
</style>
