<template>
  <div>
    <div
      class="color-picker"
      v-bind:style="colorSelectorStyleObject"
      @mousedown="toggleShown"
    ></div>
    <div class="selector-container" v-if="selectorShown">
      <ColorPicker
        theme="light"
        :color="currentColor"
        @changeColor="updateBackgroundColor"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { Ref, ref } from "vue";
import { ColorPicker } from "vue-color-kit";
import "vue-color-kit/dist/vue-color-kit.css";

const selectorShown = ref(false);

function toggleShown() {
  selectorShown.value = !selectorShown.value;
}

const emit = defineEmits<{
  (e: "onColorChanged", newColor: string): void;
}>();

const currentColor = ref("#000000");

function updateBackgroundColor(evt: { hex: string }) {
  currentColor.value = evt.hex;
  colorSelectorStyleObject.value.background = currentColor.value;
  emit("onColorChanged", currentColor.value);
}

const colorSelectorStyleObject: Ref<Record<string, string>> = ref({
  width: "16px",
  height: "16px",

  /* Global/05. Warning */
  background: currentColor.value, // "#FFC107",

  /* Inside auto layout */
  flex: "none",
  order: "1",
  "flex-grow": "0",

  display: "flex",
  "justify-content": "center",
  "align-items": "center",

  border: "1px black solid",
  "border-radius": "2px",
});
</script>
<style scoped>
.selector-container {
  position: relative;
  left: -220px;
  top: -420px;
  z-index: 100;
  width: auto;
  height: auto;
  padding: 20px;
}
</style>
