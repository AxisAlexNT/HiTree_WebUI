<template>
  <div v-if="debug">
    Min: {{ signalMin }} Max: {{ signalMax }} Step:
    {{ (signalMax - signalMin) / 100.0 }}
    Selected: [{{ lowerBound }}, {{ upperBound }}]
  </div>
  <div id="contrast-slider-div">
    <!-- <label for="contrast-slider"> Contrast: </label> -->
    <MultiRangeSlider
      id="contrast-slider"
      :base-class-name="baseClassName"
      :min="signalMin"
      :max="signalMax"
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
          :min="signalMin"
          :max="signalMax"
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
          :min="signalMin"
          :max="signalMax"
          :step="stepLength"
          v-model.number="upperBound"
        />
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import "@/app/ui/components/sidebar/contrast-slider.css";
import { Ref, ref, watch } from "vue";
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

function recalculateStepLength(): void {
  stepLength.value = (signalMax.value - signalMin.value) / stepResolution.value;
}

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
  signalMax.value = ranges.globalMaxSignal;
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

.number-input {
  width: 100px;
  margin-left: 10px;
}
</style>
