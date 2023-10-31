import { defineStore } from "pinia";
import { ref, Ref } from "vue";

export const usehtmlElementReferencesStore = defineStore(
  "htmlElementReferencesStore",
  () => {
    const mapTarget: Ref<HTMLElement | null> = ref(null);
    const miniMapTarget: Ref<HTMLElement | null> = ref(null);

    return {
      mapTarget,
      miniMapTarget,
    };
  }
);
