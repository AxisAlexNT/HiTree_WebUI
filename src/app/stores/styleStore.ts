import { ColorTranslator } from "colortranslator";
import { defineStore } from "pinia";
import { Ref, ref } from "vue";

export const useStyleStore = defineStore("styles", () => {
  const mapBackgroundColor: Ref<ColorTranslator> = ref(
    new ColorTranslator("rgb(255,255,255)", { legacyCSS: true })
  ) as Ref<ColorTranslator>;
  function setMapBackground(nc: ColorTranslator) {
    mapBackgroundColor.value = nc;
  }

  return { mapBackgroundColor, setMapBackground };
});
