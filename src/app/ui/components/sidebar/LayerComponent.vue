<template>
  <div class="layer-record">
    <span class="layer-name">{{ layerName }}</span>
    <div class="button-block">
      <i
        v-if="visible"
        class="bi bi-eye-fill visibility-btn"
        @click="updateVisibility"
      ></i>
      <i
        v-if="!visible"
        class="bi bi-eye-slash visibility-btn"
        @click="updateVisibility"
      ></i>
      <ColorPickerRectangle
        :position="['top', 'left']"
        :getDefaultColor="getBaseColor"
        @onColorChanged="updateBackgroundColor"
      ></ColorPickerRectangle>
      <div class="tri-square border-style-btn" @click="updateBorderStyle">
        <i v-if="bordersStyle === 0" class="bi bi-square"></i>
        <i v-if="bordersStyle === 1" class="bi bi-arrow-down-left"></i>
        <i v-if="bordersStyle === 2" class="bi bi-arrow-up-right"></i>
      </div>
      <i class="bi bi-pencil edit-btn" @click="editLayer"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Ref, ref } from "vue";
import { BorderStyle } from "@hict/app/core/tracks/Track2DSymmetric";
import ColorPickerRectangle from "./ColorPickerRectangle.vue";
import Style from "ol/style/Style";
import { Color } from "ol/color";
import { toast } from "vue-sonner";
import { ColorTranslator } from "colortranslator";
import { ColorLike } from "ol/colorlike";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  layerName: string;
  getDefaultColor?: () => Style | undefined;
}>();

function getBaseColor(): ColorTranslator {
  if (props.getDefaultColor) {
    const olColorString = props
      .getDefaultColor()
      ?.getStroke()
      ?.getColor() as ColorLike as string;

    const color = new ColorTranslator(olColorString, { legacyCSS: true });
    if (color) {
      return color;
    }
  }
  return new ColorTranslator("rgb(127, 192, 224)", { legacyCSS: true });
}

const emit = defineEmits<{
  (e: "onColorChanged", layerName: string, newColor: ColorTranslator): void;
  (
    e: "onBorderStyleChanged",
    layerName: string,
    borderStyle: BorderStyle
  ): void;
}>();

const currentColor = ref(new ColorTranslator("#ffaaff", { legacyCSS: true }));

const bordersStyle: Ref<number> = ref(0);
const visible: Ref<boolean> = ref(true);

function updateVisibility() {
  visible.value = !visible.value;
  emit(
    "onBorderStyleChanged",
    props.layerName as string,
    visible.value ? bordersStyle.value : BorderStyle.NONE
  );
}
function updateBackgroundColor(newColor: ColorTranslator) {
  currentColor.value = newColor;
  emit("onColorChanged", props.layerName as string, newColor);
}
function updateBorderStyle() {
  bordersStyle.value += 1;
  bordersStyle.value %= 3;

  emit("onBorderStyleChanged", props.layerName as string, bordersStyle.value);
  // (Object.values(BorderStyle) as Array<BorderStyle>)[bordersStyle.value]
}
function editLayer() {
  toast.error("Editing layer is not implemented for " + props.layerName);
}
</script>

<style scoped>
.layer-record {
  /* layer */

  /* Auto layout */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0px;
  gap: 20px;

  width: 200px;
  height: 20px;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

.layer-name {
  /* layer name */

  width: 21px;
  height: 20px;

  /* Body/Small */
  font-family: "Roboto", ui-sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 19px;

  /* identical to box height, or 150% */
  display: flex;
  align-items: center;
  text-align: center;

  /* Global/08. Dark */
  color: #343a40;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

.button-block {
  /* btn block */

  /* Auto layout */
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 12px;

  width: 116px;
  height: 20px;

  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}

.visibility-btn {
  /* Eye fill */

  width: 20px;
  height: 20px;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;

  display: flex;
  justify-content: center;
  align-items: center;
}

.border-style-btn {
  /* Square */

  width: 20px;
  height: 20px;

  /* Inside auto layout */
  flex: none;
  order: 2;
  flex-grow: 0;

  display: flex;
  justify-content: center;
  align-items: center;
}

.edit-btn {
  /* Pencil */

  width: 20px;
  height: 20px;

  /* Inside auto layout */
  flex: none;
  order: 3;
  flex-grow: 0;

  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
