<template>
  <div v-if="debug">
    Min: {{ signalMin }} Max: {{ signalMax }} Step:
    {{ (signalMax - signalMin) / 100.0 }}
    Selected: [{{ lowerBound }}, {{ upperBound }}]
  </div>
  <MultiRangeSlider
    :base-class-name="baseClassName"
    :min="signalMin"
    :max="signalMax"
    :step="(signalMax - signalMin) / 100.0"
    :ruler="false"
    :label="false"
    :min-value="signalMin"
    :max-value="signalMax"
    :range-margin="0"
    @input="updateContrast"
  />
</template>

<script setup lang="ts">
import MultiRangeSlider from "multi-range-slider-vue";
import "@/app/ui/components/sidebar/contrast-slider.css";
import { Ref, ref } from "vue";
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";

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

function updateContrast(e: {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
}) {
  lowerBound.value = e.minValue;
  upperBound.value = e.maxValue;
  props.mapManager?.eventManager.onContrastChanged({
    lowerSignalBound: lowerBound.value,
    upperSignalBound: upperBound.value,
  });
  if (debug) {
    console.log(
      "Slider update values called bMinV: ",
      lowerBound.value,
      " bMaxV: ",
      upperBound.value,
      " event: ",
      e
    );
  }
}
</script>

<style scoped></style>
