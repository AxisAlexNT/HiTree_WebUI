<template>
  <div>
    <div :style="colorSelectorStyleObject" ref="vPicker"></div>
  </div>
</template>
<script setup lang="ts">
import { Ref, onMounted, ref, watch } from "vue";
import "toolcool-color-picker";
import Picker from "vanilla-picker";
import "vanilla-picker/dist/vanilla-picker.csp.css";

type position = false | "top" | "bottom" | "left" | "right";

const props = defineProps<{
  position?: position | position[];
  getDefaultColor: () => string | undefined;
}>();

const picker: Ref<Picker | null> = ref(null);

const emit = defineEmits<{
  (e: "onColorChanged", newColor: string): void;
}>();

const currentColor = ref(props.getDefaultColor());

const vPicker: Ref<HTMLElement | null> = ref(null);

watch(
  () => props.getDefaultColor(),
  () => {
    const nc = props.getDefaultColor();
    if (nc) {
      // console.log("Picker rectangle: new color", nc);
      // nc = "rgba(255,0,0,1.000000)";
      const re =
        /\s*rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*((\d+)([,.](\d+))?)\s*\)\s*/;
      const alpha = nc.replace(re, "$4").replace(/,/, ".");
      currentColor.value = nc.replace(re, `rgba($1,$2,$3,${alpha})`);
      colorSelectorStyleObject.value["background"] = currentColor.value;
      picker.value?.setColor(currentColor.value, false);
      // console.log("Picker rectangle: new color", currentColor.value);
    }
  }
);

onMounted(() => {
  if (!currentColor.value) {
    currentColor.value = "#00000000";
  }
  if (vPicker.value) {
    picker.value = new Picker({
      parent: vPicker.value,
      color: currentColor.value,
      onChange: function (color) {
        currentColor.value = color.rgbaString as string;
        colorSelectorStyleObject.value["background"] = currentColor.value;
      },
      onDone: function (color) {
        currentColor.value = color.rgbaString as string;
        colorSelectorStyleObject.value["background"] = currentColor.value;
        emit("onColorChanged", currentColor.value);
      },
      // @ts-expect-error Library actiually supports multiple terms in positioning
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
