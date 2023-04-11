<template>
  <div
    id="horizontal-p5-div"
    style="height: auto; min-height: 100%; /*overflow: auto*/ width: 100px"
  ></div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch } from "vue";
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";

import {} from "p5";
import P5 from "p5";
import {} from "@/p5/lib/addons/p5.dom";

// import {
//   Roulette,
//   RouletteValidator,
//   Interval,
//   Point,
// } from "@/app/ui/components/tracks/ruler/roulette";

import {
  Roulette,
  RouletteConfig,
  Vector,
} from "@/app/ui/components/tracks/ruler/Roulette";

const props = defineProps<{
  mapManager: ContactMapManager | undefined;
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
        roulette.value.invalidate();

        initialized.value = true;
      }
    });

    newManager?.viewAndLayersManager.resolutionChangedAsyncSubscribers.push(
      async () => {

        const newZoom = newManager?.getView().getZoom() ?? 0;
        const newResolution = newManager?.getView().getResolutionForZoom(newZoom);

        const pixel = newManager?.getMap().getPixelFromCoordinate([0, 0]);

        const bpResolution =
          newManager?.viewAndLayersManager?.currentViewState.resolutionDesciptor
            .bpResolution;
        const prefixSumPx =
          newManager?.contigDimensionHolder.prefix_sum_px.get(bpResolution) ??
          [];
        const baseLength = prefixSumPx[prefixSumPx.length - 1];

        const pixelResolution =
          newManager?.getLayersManager().currentViewState.resolutionDesciptor
            .pixelResolution; //newResolution;
        // const basePixelResolution =
        //   newManager?.viewAndLayersManager.pixelResolutionSet[
        //     newManager?.viewAndLayersManager.currentViewState
        //       .resolutionDesciptor.imageSizeIndex
        //   ];

        const size = Math.round(baseLength * (pixelResolution / newResolution));

        // console.log(pixel);
        // console.log(
        //   "size",
        //   size,
        //   "pixelResolution",
        //   pixelResolution,
        //   "basePixelResolution",
        //   basePixelResolution,
        //   "bpResolution",
        //   bpResolution,
        //   "newResolution",
        //   newResolution
        // );

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

      setupRoulette(newDiv);
    }
  );
});

function setupRoulette(newDiv: Element): void {
  const WIDTH = newDiv.getBoundingClientRect().width;
  const HEIGHT = newDiv.getBoundingClientRect().height;

  const offset = 50;

  // const roulette = new Roulette(
  //   new Interval(0, WIDTH),
  //   0,
  //   400,
  //   // 100_000_000,
  //   200,
  //   new RouletteValidator(
  //     new Point(offset, HEIGHT / 2),
  //     true,
  //     (e) =>
  //       e// props.mapManager?.contigDimensionHolder.getStartBpOfPx(
  //       //   e,
  //       //   props.mapManager?.viewAndLayersManager.currentViewState
  //       //     .resolutionDesciptor.bpResolution
  //       // ) ?? WIDTH
  //   )
  // );

  // const drawLine = (s, e) => console.log(`${s} - ${e}`);
  // const drawText = (p, t) => console.log(`${p}: ${t}`);
  // const drawMark = (p) => console.log(`> ${p}`);

  roulette.value = new Roulette(
    new RouletteConfig(
      new Vector(100, HEIGHT / 2),
      WIDTH,
      true,
      (e) =>
        props.mapManager?.contigDimensionHolder.getStartBpOfPx(
          e,
          props.mapManager?.viewAndLayersManager.currentViewState
            .resolutionDesciptor.bpResolution
        ) ?? WIDTH
    ),
    400,
    100_000_000
  );

  const sketch = (p5: P5) => {
    p5.setup = () => {
      const canvas = p5.createCanvas(WIDTH + 2 * offset, HEIGHT);
      canvas.parent(newDiv);

      p5.background("white");
    };

    p5.draw = () => {
      p5.background("white");

      p5.textAlign(p5.CENTER);
      // p5.line(0, 0, WIDTH + 2 * offset, HEIGHT);

      if (roulette.value) {
        roulette.value.draw(
          (s, e) => p5.line(s.x, s.y, e.x, e.y),
          (p, t) => p5.text(t, p.x, p.y),
          (p) => p5.line(p.x, p.y - 5, p.x, p.y + 5)
        );
      }
    };
  };

  new P5(sketch);

  console.log("Horizontal roulette:", roulette);

  // watch(() => props.mapManager?.getLayersManager().layersHolder.hicDataLayers.length,
  //   (newLength, _) => {
  //     if (newLength) {
  //       props.mapManager?.getLayersManager().initHorizontalRoulette(roulette);
  //       roulette.invalidate();
  //
  //       console.log("#", props.mapManager?.getMap().getPixelFromCoordinate([0, 0]));
  //     }
  //   });

  // props.mapManager?.getLayersManager().initHorizontalRoulette(roulette);
  // roulette.invalidate();
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
