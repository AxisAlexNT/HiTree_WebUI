<template>
  <!-- TODO: Fix -->
  <div v-if="debug">
    Min: {{ signalMin }} Max: {{ signalMax }} Step:
    {{ (signalMax - signalMin) / 100.0 }}
    Selected: [{{ lowerBound }}, {{ upperBound }}]
  </div>
  <div id="contrast-slider-div">
    <label id="contrast-slider-label" class="h6" for="contrast-slider"
      ><strong>Contrast range:</strong></label
    >
    <!-- <h5><strong>Contrast range:</strong></h5> -->
    <MultiRangeSlider
      id="contrast-slider"
      :base-class-name="baseClassName"
      :min="signalsMins[1 + currentZoomLevel] ?? 0"
      :max="signalsMaxs[1 + currentZoomLevel] ?? 1"
      :step="stepLength"
      :ruler="false"
      :label="false"
      :min-value="lowerBound"
      :max-value="upperBound"
      :range-margin="0"
      @mouseup="sendContrast"
      @input="updateContrast"
    />
  </div>
  <ul class="list-group w-100">
    <li class="list-group-item w-100">
      <div class="m-0 w-100">
        <label for="lower-bound-input">Lower: </label>
        <input
          class="form-check-input number-input"
          type="number"
          id="lower-bound-input"
          :min="signalsMins[1 + currentZoomLevel] ?? 0"
          :max="signalsMaxs[1 + currentZoomLevel] ?? 1"
          :step="stepLength"
          v-model.number="lowerBound"
        />
      </div>
    </li>
    <li class="list-group-item w-100">
      <div class="m-0 w-100">
        <label for="upper-bound-input">Upper: </label>
        <input
          class="form-check-input number-input"
          type="number"
          id="upper-bound-input"
          :min="signalsMins[1 + currentZoomLevel] ?? 0"
          :max="signalsMaxs[1 + currentZoomLevel] ?? 1"
          :step="stepLength"
          v-model.number="upperBound"
        />
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import "@/app/ui/components/sidebar/contrast-slider.css";
import { Ref, ref, unref, watch } from "vue";
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";
import { CurrentSignalRangeResponse } from "@/app/core/net/api/response";
// @ts-expect-error "The module has no typescript bindings provided"
import MultiRangeSlider from "multi-range-slider-vue";

const debug = false;

const props = defineProps<{
  mapManager?: ContactMapManager;
}>();

const signalMin: Ref<number> = ref(0);
const signalMax: Ref<number> = ref(1);

// const baseClassName = "multi-range-slider"; // "contrast-slider";
const baseClassName = "contrast-slider";
const lowerBound: Ref<number> = ref(signalMin.value);
const upperBound: Ref<number> = ref(signalMax.value);
const stepResolution: Ref<number> = ref(1000);
const stepLength: Ref<number> = ref(
  (signalMax.value - signalMin.value) / stepResolution.value
);

const signalsMins: Ref<number[]> = ref([0]);
const signalsMaxs: Ref<number[]> = ref([1]);

function recalculateStepLength(): void {
  stepLength.value = (signalMax.value - signalMin.value) / stepResolution.value;
}

const currentZoomLevel: Ref<number> = ref(0);

watch(() => stepLength.value, recalculateStepLength);
watch(() => signalMin.value, recalculateStepLength);
watch(() => signalMax.value, recalculateStepLength);

// const sliderParams: {
//   min: Ref<number>;
//   max: Ref<number>;
//   min_value: Ref<number>;
//   max_value: Ref<number>;
//   step: Ref<number>;
// } = {
//   min: signalMin,
//   max: signalMax,
//   min_value: lowerBound,
//   max_value: upperBound,
//   step: stepLength,
// };

// console.log("Slider params:", sliderParams);

watch(
  () => props.mapManager,
  (newManager, oldManager) => {
    // console.log("MapManager changed from: ", oldManager, "to: ", newManager);
    newManager?.addContrastSliderCallback(updateWithRanges);
    newManager?.viewAndLayersManager.resolutionChangedAsyncSubscribers.push(
      () =>
        onZoomLevelChanged(
          newManager?.viewAndLayersManager?.currentViewState.resolutionDesciptor
            .imageSizeIndex ?? 0
        )
    );
  }
);

function updateContrast(evt: {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
}): void {
  if (debug) {
    console.log(
      "Slider update values called bMinV: ",
      lowerBound.value,
      " bMaxV: ",
      upperBound.value,
      " event: ",
      evt
    );
  }
  lowerBound.value = evt.minValue;
  upperBound.value = evt.maxValue;
}

function sendContrast(evt: unknown): void {
  if (debug) {
    console.log(
      "sendContrast called bMinV: ",
      lowerBound.value,
      " bMaxV: ",
      upperBound.value,
      " event: ",
      evt
    );
  }
  props.mapManager?.eventManager.onContrastChanged({
    lowerSignalBound: lowerBound.value,
    upperSignalBound: upperBound.value,
  });
}

// function fetchRanges(tileVersion: number) {
//   // console.log("Fetch ranges called with ", tileVersion);
//   props.mapManager?.networkManager.requestManager
//     .getSignalRanges(tileVersion)
//     .then(updateWithRanges);
// }

function updateWithRanges(ranges: CurrentSignalRangeResponse) {
  if (debug) {
    console.log("ranges arrived: ", ranges);
  }
  signalsMaxs.value = ranges.maxSignalAtLevel;
  signalsMins.value = ranges.minSignalAtLevel;
}

async function onZoomLevelChanged(newIndex: number): Promise<void> {
  if ((!newIndex && newIndex !== 0) || newIndex == currentZoomLevel.value) {
    return;
  }
  const currentSignalsMins: Array<number | undefined> = unref(
    signalsMins.value
  );
  const currentSignalsMaxs: Array<number | undefined> = unref(
    signalsMins.value
  );
  if (
    !isFinite(currentSignalsMins[1 + newIndex] ?? NaN) ||
    !isFinite(currentSignalsMaxs[1 + newIndex] ?? NaN)
  ) {
    if (debug) {
      console.log(
        `Not updating contrast ratio because signalsMins.value[1+newIndex] where newIndex is ${newIndex} is not finite: ${
          signalsMins.value
        }[${newIndex}] === ${signalsMins.value[1 + newIndex]}`
      );
      console.log(
        `Not updating contrast ratio because signalsMaxs.value[1+newIndex] where newIndex is ${newIndex} is not finite: ${
          signalsMaxs.value
        }[${newIndex}] === ${signalsMaxs.value[1 + newIndex]}`
      );
      console.log("SignalsMins value is ", currentSignalsMins);
      console.log("SignalsMaxs value is ", currentSignalsMaxs);
    }
    return;
  }
  if (debug) {
    console.log(
      "Current zoom level is ",
      currentZoomLevel,
      " moving to level ",
      newIndex
    );
    console.log("SignalsMins: ", signalsMins, " Maxs: ", signalsMaxs);
  }
  const oldRange = Math.max(1e-8, signalMax.value - signalMin.value);
  const ratioLower = (lowerBound.value - signalMin.value) / oldRange;
  const ratioUpper = (upperBound.value - signalMin.value) / oldRange;
  if (debug) {
    console.log(
      `Contrast slider: OLD: min=${signalMin.value} max=${signalMax.value} range=${oldRange} lowerBound=${lowerBound.value} upperBound=${upperBound.value} lBratio=${ratioLower} uBratio=${ratioUpper}`
    );
  }
  signalMin.value = signalsMins.value[1 + newIndex ?? 0];
  signalMax.value = signalsMaxs.value[1 + newIndex ?? 0];
  if (!isFinite(signalMin.value)) {
    if (debug) {
      console.log(
        "Minimum value for slider is not finite: ",
        signalMin.value,
        "=",
        signalsMins.value,
        "[",
        1 + newIndex,
        "]=",
        signalsMins.value[1 + newIndex]
      );
    }
    signalMin.value = 0;
  }
  if (!isFinite(signalMax.value)) {
    console.log("Maximum value for slider is not finite: ", signalMin.value);
    signalMax.value = 1;
  }
  const newRange = Math.max(0, signalMax.value - signalMin.value);
  lowerBound.value = Math.max(
    lowerBound.value,
    signalMin.value + newRange * ratioLower
  );
  upperBound.value = Math.min(
    upperBound.value,
    signalMin.value + newRange * ratioUpper
  );
  if (debug) {
    console.log(
      `Contrast slider: NEW: min=${signalMin.value} max=${signalMax.value} range=${newRange} lowerBound=${lowerBound.value} upperBound=${upperBound.value}`
    );
  }
  currentZoomLevel.value = newIndex;
}
</script>

<style scoped>
#contrast-slider-div {
  margin-top: -20px;
  margin-bottom: -20px;
  margin-left: 0px;
  margin-right: 0px;
  width: 100%;
  text-align: left;
}

#contrast-slider-label {
  margin-bottom: -20px;
  /* margin-top: 20px;*/
  height: 16pt;
}

#contrast-slider {
  margin-top: -10px;
}

.number-input {
  width: 100px;
  height: 16pt;
  margin-left: 10px;
}
</style>
