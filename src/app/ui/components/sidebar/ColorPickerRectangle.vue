<template>
  <div>
    <div :style="colorSelectorStyleObject" ref="vPicker"></div>
  </div>
</template>
<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";
import "toolcool-color-picker";
import Picker from "vanilla-picker/csp";
import "vanilla-picker/dist/vanilla-picker.csp.css";

const props = defineProps<{
  position: string | string[] | undefined;
  getDefaultColor: () => string | undefined;
}>();

const picker: Ref<Picker | null> = ref(null);

const emit = defineEmits<{
  (e: "onColorChanged", newColor: string): void;
}>();

const currentColor = ref(props.getDefaultColor());

const vPicker: Ref<HTMLElement | null> = ref(null);

onMounted(() => {
  if (!currentColor.value) {
    currentColor.value = "#00000000";
  }
  if (vPicker.value) {
    picker.value = new Picker({
      parent: vPicker.value,
      color: currentColor.value,
      onChange: function (color: Record<string, unknown>) {
        currentColor.value = color.rgbaString as string;
        colorSelectorStyleObject.value["background"] = currentColor.value;
      },
      onDone: function (color: Record<string, unknown>) {
        currentColor.value = color.rgbaString as string;
        colorSelectorStyleObject.value["background"] = currentColor.value;
        emit("onColorChanged", currentColor.value);
      },
      popup: props.position ?? ["top", "left"],
    });
  }
});

const colorSelectorStyleObject: Ref<Record<string, string>> = ref({
  width: "16px",
  height: "16px",

  /* Global/05. Warning */
  background: currentColor.value ?? "#FFC107",

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
<style scoped></style>
