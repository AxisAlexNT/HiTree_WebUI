<template>
  <div id="hic-contact-map" :style="mapContainerStyle" ref="mapTarget"></div>
</template>

<script setup lang="ts">
import "ol/ol.css";
import { useStyleStore } from "@/app/stores/styleStore";
import { ref, computed, Ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { usehtmlElementReferencesStore } from "@/app/stores/htmlElementReferencesStore";

const stylesStore = useStyleStore();

const htmlElementReferencesStore = usehtmlElementReferencesStore();

const { mapTarget, miniMapTarget } = storeToRefs(htmlElementReferencesStore);

const hicContactMap: Ref<HTMLElement | null> = ref(null);

watch(
  () => hicContactMap.value,
  () => (mapTarget.value = hicContactMap.value)
);

const mapContainerStyle = ref({
  width: "100%",
  height: "100%",
  "padding-right": "15px",
});
</script>

<style scoped></style>
