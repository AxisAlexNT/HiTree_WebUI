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
      <div v-bind:style="colorSelectorStyleObject"></div>
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
  layerName: String,
});

const bordersStyle: Ref<number> = ref(0);
const visible: Ref<boolean> = ref(true);
const colorSelectorStyleObject: Ref<Record<string, string>> = ref({
  width: "16px",
  height: "16px",

  /* Global/05. Warning */
  background: "#FFC107",

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

function updateBorderStyle() {
  bordersStyle.value += 1;
  bordersStyle.value %= 3;
}
function updateVisibility() {
  visible.value = !visible.value;
}
function editLayer() {
  alert("Edit layer?");
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
