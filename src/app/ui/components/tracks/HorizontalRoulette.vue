<template>
  <div
    id="horizontal-p5-div"
    style="
      height: auto;
      min-height: 100%;
      /*overflow: auto;*/
      width: 100px;
      align-content: center;
    "
  >
    <RouletteLayer
      v-for="component of this.roulette?.layers() ?? []"
      :key="component.name"
      :name="component.name"
      :roulette="component"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch } from "vue";
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";

import { TrackManager } from "@/app/core/roulette/BedParser";
import { Roulette, RouletteConfig, RouletteOrientation } from "@/app/core/roulette/Roulette";
import { defaultTrackHolder, mappings } from "@/app/ui/components/tracks/AbstractRouletteBrowser";
import { Vector } from "@/app/core/roulette/tuple";
import RouletteLayer from "@/app/ui/components/tracks/RouletteLevel.vue";

const props = defineProps<{
  mapManager: ContactMapManager | undefined;
  trackManager: TrackManager | undefined;
}>();

const roulette: Ref<Roulette | undefined> = ref(undefined);
const initialized: Ref<boolean> = ref(false);

watch(
  () => props.mapManager,
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
      acceptContig,
      props.trackManager ?? defaultTrackHolder
    )
  );

  console.log("Horizontal roulette:", roulette);
}
</script>

<style scoped>
#horizontal-igv-track-div {
  /* background-color: blue; */
  width: 100%;
  height: 100%;
  border: 1px solid black;
}
</style>
