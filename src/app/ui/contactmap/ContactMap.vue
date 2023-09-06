<template>
  <div id="hic-contact-map" :style="mapContainerStyle"></div>
</template>

<script setup lang="ts">
import "ol/ol.css";
import { useStyleStore } from "@/app/stores/styleStore";
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";

const stylesStore = useStyleStore();

const mapContainerStyle = ref({
  width: "100%",
  height: "100%",
  "padding-right": "15px",
  "background-color": computed(() => stylesStore.mapBackgroundColor),
});
</script>

<style scoped></style>
