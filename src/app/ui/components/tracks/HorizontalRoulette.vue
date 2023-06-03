<template>
  <div class="roulette-holder" id="horizontal-p5-div">
    <RouletteComponent
      v-for="component of this.roulette?.components ?? []"
      :key="component.name"
      :roulette="this.roulette!"
      :component="component"
      :name="component.name"
      @delete-component="emit('delete-component', component.name)"
    />
    <RouletteLayer
      v-if="roulette !== undefined"
      :roulette="this.roulette!"
      name="ticks"
      component-name="HorizontalRoulette"
      :layer="this.roulette!.ticks"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUpdated, ref, Ref, watch } from "vue";
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";

import { TrackManager } from "@/app/core/roulette/BedParser";
import {
  Roulette,
  RouletteConfig,
  RouletteOrientation,
} from "@/app/core/roulette/Roulette";
import { mappings } from "@/app/ui/components/tracks/AbstractRouletteBrowser";
import RouletteComponent from "@/app/ui/components/tracks/RouletteComponent.vue";
import RouletteLayer from "@/app/ui/components/tracks/RouletteLayer.vue";

const emit = defineEmits<{
  (e: "delete-component", componentName: string): void;
}>();

const props = defineProps<{
  mapManager: ContactMapManager | undefined;
  trackManagers: Array<TrackManager>;
}>();

const roulette: Ref<Roulette | undefined> = ref(undefined);
const initialized: Ref<boolean> = ref(false);

watch(
  () => props.mapManager,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (newManager, _) => {
    newManager?.addContrastSliderCallback(() => {
      if (roulette.value && !initialized.value) {
        props.mapManager
          ?.getLayersManager()
          .initHorizontalRoulette(roulette.value);
        roulette.value?.init();

        for (const tm of props.trackManagers) {
          roulette.value?.addComponent(tm);
        }

        initialized.value = true;
      }
    });

    newManager?.viewAndLayersManager.resolutionChangedAsyncSubscribers.push(
      async () => {
        const newZoom = newManager?.getView().getZoom() ?? 0;
        const newResolution = newManager
          ?.getView()
          .getResolutionForZoom(newZoom);

        const pixel = newManager?.getMap().getPixelFromCoordinate([0, 0]);

        const bpResolution =
          newManager?.viewAndLayersManager?.currentViewState.resolutionDesciptor
            .bpResolution;
        // eslint-disable-next-line
        const prefixSumPx = newManager?.contigDimensionHolder.prefix_sum_px.get(bpResolution) ?? [];
        const baseLength = prefixSumPx[prefixSumPx.length - 1];

        const pixelResolution =
          newManager?.getLayersManager().currentViewState.resolutionDesciptor
            .pixelResolution;

        const size = Math.round(baseLength * (pixelResolution / newResolution));

        roulette.value?.zoom(pixel[0], size);
      }
    );
  }
);

watch(
  () => props.trackManagers.length,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  () => {
    for (const tm of props.trackManagers) {
      roulette.value?.addComponent(tm);
    }
  }
);

const hook = () => {
  const newDiv = document.getElementById("horizontal-p5-div");
  if (!newDiv) {
    alert("FAILED: `newDiv` in HorizontalIGVTrack.vue");
    return;
  }

  watch(
    () => props.mapManager?.contigDimensionHolder.contigDescriptors,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (updated, _) => {
      if (!updated) {
        return;
      }

      setupHorizontalRoulette();
    }
  );
};

onMounted(hook);
onUpdated(hook);

function setupHorizontalRoulette() {
  const [acceptContig, pixelToValue, valueToPixel] = mappings(props.mapManager);

  roulette.value = new Roulette(
    new RouletteConfig(
      RouletteOrientation.HORIZONTAL,
      pixelToValue,
      valueToPixel,
      acceptContig
    )
  );

  console.log("Horizontal roulette:", roulette);
}
</script>

<style scoped>
.roulette-holder {
  grid-auto-rows: max-content;
}

#horizontal-p5-div {
  width: 100%;
  height: auto;
  display: grid;
  overflow: visible;
  align-content: center;
}
</style>
