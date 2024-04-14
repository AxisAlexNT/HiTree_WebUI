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
import { ColorTranslator } from "colortranslator";

type position = false | "top" | "bottom" | "left" | "right";

const props = defineProps<{
  position?: position | position[];
  getDefaultColor: () => ColorTranslator | undefined;
}>();

const picker: Ref<Picker | null> = ref(null);

const emit = defineEmits<{
  (e: "onColorChanged", newColor: ColorTranslator): void;
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
      // const re =
      //   /\s*rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*((\d+)([,.](\d+))?)\s*\)\s*/;
      // const alpha = nc.replace(re, "$4").replace(/,/, ".");
      // currentColor.value = nc.replace(re, `rgba($1,$2,$3,${alpha})`);
      currentColor.value = nc;
      colorSelectorStyleObject.value["background"] = currentColor.value.RGBA;
      picker.value?.setColor(currentColor.value.RGBA, false);
      // console.log("Picker rectangle: new color", currentColor.value);
    }
  }
);

onMounted(() => {
  if (!currentColor.value) {
    currentColor.value = new ColorTranslator("#00000000", { legacyCSS: true });
  }
  if (vPicker.value) {
    picker.value = new Picker({
      parent: vPicker.value,
      color: currentColor.value.RGBA,
      onChange: function (color) {
        currentColor.value = new ColorTranslator(color.rgbaString as string, {
          legacyCSS: true,
        });
        colorSelectorStyleObject.value["background"] = currentColor.value.RGBA;
      },
      onDone: function (color) {
        currentColor.value = new ColorTranslator(color.rgbaString as string, {
          legacyCSS: true,
        });
        colorSelectorStyleObject.value["background"] = currentColor.value.RGBA;
        emit("onColorChanged", currentColor.value as ColorTranslator);
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
  background: currentColor.value?.HEXA ?? "#FFC107",

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
