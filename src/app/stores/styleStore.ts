import { defineStore } from "pinia";
import { ref } from "vue";

export const useStyleStore = defineStore("styles", () => {
  const mapBackgroundColor = ref("rgb(255,255,255)");
  function setMapBackground(nc: string) {
    mapBackgroundColor.value = nc;
  }

  return { mapBackgroundColor, setMapBackground };
});
