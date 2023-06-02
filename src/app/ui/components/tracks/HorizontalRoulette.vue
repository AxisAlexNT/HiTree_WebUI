<template>
  <div class="roulette-holder" id="horizontal-p5-div">
    <RouletteComponent
      v-for="component of this.roulette?.components ?? []"
      :key="component.name"
      :roulette="this.roulette!"
      :component="component"
      :name="component.name"
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
import { onMounted, ref, Ref, watch } from "vue";
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";

import { TrackManager } from "@/app/core/roulette/BedParser";
import {
  Roulette,
  RouletteConfig,
  RouletteOrientation,
} from "@/app/core/roulette/Roulette";
import {
  defaultTrackManager,
  mappings,
} from "@/app/ui/components/tracks/AbstractRouletteBrowser";
import { Vector } from "@/app/core/roulette/tuple";
import RouletteComponent from "@/app/ui/components/tracks/RouletteComponent.vue";
import RouletteLayer from "@/app/ui/components/tracks/RouletteLayer.vue";

const props = defineProps<{
  mapManager: ContactMapManager | undefined;
  trackManager: TrackManager | undefined;
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
        roulette.value.init();

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

onMounted(() => {
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

      setupHorizontalRoulette(newDiv);
    }
  );
});

function setupHorizontalRoulette(newDiv: Element) {
  const width = newDiv.getBoundingClientRect().width;
  const height = newDiv.getBoundingClientRect().height;

  const [acceptContig, pixelToValue, valueToPixel] = mappings(props.mapManager);

  roulette.value = new Roulette(
    new RouletteConfig(
      new Vector(0, (height * 3) / 4),
      width,
      RouletteOrientation.HORIZONTAL,
      pixelToValue,
      valueToPixel,
      acceptContig
    )
  );

  roulette.value?.init();

  roulette.value?.addComponent(props.trackManager ?? defaultTrackManager);

  console.log("Horizontal roulette:", roulette);
}
</script>

<style scoped>
.roulette-holder {
  display: grid;
}

#horizontal-igv-track-div {
  /* background-color: blue; */
  width: 100%;
  height: 100%;
  border: 1px solid black;
}

#horizontal-p5-div {
  height: auto;
  min-height: 100%;
  /*overflow: auto;*/
  width: 100px;
  align-content: center;
}
</style>
