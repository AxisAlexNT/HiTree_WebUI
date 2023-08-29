<template>
  <div>
    <!-- <div
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
    </div> -->
    <toolcool-color-picker
      ref="tcPicker"
      :color="currentColor"
      popup-position="right"
    ></toolcool-color-picker>
  </div>
</template>
<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";
// import { ColorPicker } from "vue-color-kit";
import "toolcool-color-picker";
import ColorPicker from "toolcool-color-picker";
// import "vue-color-kit/dist/vue-color-kit.css";

const props = defineProps<{
  getDefaultColor: () => string | undefined;
}>();

const selectorShown = ref(false);

function toggleShown() {
  selectorShown.value = !selectorShown.value;
}

const emit = defineEmits<{
  (e: "onColorChanged", newColor: string): void;
}>();

const currentColor = ref(props.getDefaultColor());

const tcPicker: Ref<HTMLElement | null> = ref(null);

onMounted(() => {
  if (!currentColor.value) {
    currentColor.value = "#000000";
  }
  if (tcPicker.value) {
    const picker = tcPicker.value as ColorPicker;
    picker.color = currentColor.value;
    picker.addEventListener("change", updateBackgroundColorTC);
  }
});

function updateBackgroundColor(evt: {
  hex: string;
  rgba: { r: number; g: number; b: number; a: number };
}) {
  // currentColor.value = evt.hex;
  currentColor.value = `rgba(${evt.rgba.r},${evt.rgba.g},${evt.rgba.b},${evt.rgba.a})`;
  // console.log("onColorChanged: ", evt);
  colorSelectorStyleObject.value.background = currentColor.value;
  emit("onColorChanged", currentColor.value);
}

function updateBackgroundColorTC(evt: Event) {
  const customEvent = evt as CustomEvent;
  // updateBackgroundColor(customEvent.detail.rgba);
  // console.log(customEvent.detail.rgba);
  currentColor.value = customEvent.detail.rgba;
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
