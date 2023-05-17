<template>
  <div
    id="horizontal-p5-div"
    style="height: auto; min-height: 100%; /*overflow: auto*/ width: 100px"
  ></div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch } from "vue";
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";

import P5 from "p5";

// import {
//   Roulette,
//   RouletteValidator,
//   Interval,
//   Point,
// } from "@/app/ui/components/tracks/ruler/roulette";
import {
  Contig,
  Interval,
  Roulette,
  RouletteConfig,
  RouletteObject,
  RouletteLongObject,
  Vector,
} from "@/app/ui/components/tracks/ruler/Roulette";
import { ContigDirection } from "@/app/core/domain/common";
import { BedFormatParser, FiLE_CONTENT } from "@/app/ui/components/tracks/ruler/bed-format-parser";
import { mouseOnly } from "ol/events/condition";

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
        const newResolution = newManager
          ?.getView()
          .getResolutionForZoom(newZoom);

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

  const acceptContig = (e: number) => {
    const prefixes =
      props.mapManager?.contigDimensionHolder.prefix_sum_px.get(
        props.mapManager?.getLayersManager().currentViewState
          .resolutionDesciptor.bpResolution
      ) ?? [];

    let l = -1;
    let r = prefixes.length;
    while (r - l > 1) {
      const m = Math.round(l + (r - l) / 2);
      if (prefixes[m] < e) {
        l = m;
      } else {
        r = m;
      }
    }

    // console.log(`prefixes: [${prefixes.join(", ")}]\ndirections: ${
    //   props.mapManager?.contigDimensionHolder.contigDescriptors.map((cd) => cd.direction).join(", ")}\ne: ${e}\nl, r, size: (${l}, ${r}, ${prefixes.length})\n`);

    return new Contig(
      new Interval(prefixes[l], prefixes[l + 1]),
      props.mapManager?.contigDimensionHolder.contigDescriptors.map(
        (cd) => cd.direction
      )[l] == ContigDirection.REVERSED
    );
  };

  const trackHolder = new BedFormatParser(FiLE_CONTENT, "chr1").parse();

  roulette.value = new Roulette(
    new RouletteConfig(
      new Vector(0, (HEIGHT * 3) / 4),
      WIDTH,
      true,
      (e) =>
        props.mapManager?.contigDimensionHolder.getStartBpOfPx(
          e,
          props.mapManager?.viewAndLayersManager.currentViewState
            .resolutionDesciptor.bpResolution
        ) ?? WIDTH,
      (e) =>
        props.mapManager?.contigDimensionHolder.getPxContainingBp(
          e,
          props.mapManager?.viewAndLayersManager.currentViewState
            .resolutionDesciptor.bpResolution
        ) ?? 0,
      acceptContig,
      trackHolder
    ),
    WIDTH
  );

  // const contigsPrefixSumArray =
  //   props.mapManager?.contigDimensionHolder.prefix_sum_px.get(props.mapManager?.getLayersManager().currentViewState.resolutionDesciptor.bpResolution);
  // const contigsPrefixSumArray =
  //   props.mapManager?.contigDimensionHolder.contigDescriptors.map((cd) => cd.direction).

  const sketch = (p5: P5) => {
    p5.setup = () => {
      const canvas = p5.createCanvas(WIDTH + 2 * offset, HEIGHT);
      canvas.parent(newDiv);

      p5.background("white");
    };

    let onMouseObject: RouletteLongObject | undefined = undefined;

    p5.draw = () => {
      p5.background("white");

      p5.textAlign(p5.CENTER);
      // p5.line(0, 0, WIDTH + 2 * offset, HEIGHT);

      if (!roulette.value) {
        return;
      }

      p5.textAlign("center", "center");

      roulette.value.draw(
        (s, e, w) => {
          // p5.strokeWeight(w);
          p5.line(s.x, s.y, e.x, e.y);
          p5.strokeWeight(1);
        },
        (p, t) => p5.text(t + "bp", p.x, p.y + 20),
        (p) => p5.line(p.x, p.y - 5, p.x, p.y + 5),
        (ps, color) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
          const c = result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
              } : { r: 0, g: 0, b: 0 };
          p5.fill(c.r, c.g, c.b);

          p5.beginShape();
          ps.forEach((p) => p5.vertex(p.x, p.y));
          p5.endShape(p5.CLOSE);

          p5.fill(0);
        }
      );

      if (onMouseObject) {
        // "chromosome",
        // "start",
        // "end",
        // "name",
        // "score",
        // "strand",
        // "thickStart",
        // "thickEnd",
        // "itemRgb",
        // "blockCount",
        // "blockSize",
        // "blockStarts",

        const description = [];

        p5.textAlign("left", "top");

        if (trackHolder.fieldCount >= 4) {
          description.push(`Name: ${onMouseObject.contig?.name}`);
        }
        if (trackHolder.fieldCount >= 5) {
          description.push(`Score: ${onMouseObject.contig?.score}`);
        }
        if (trackHolder.fieldCount >= 8) {
          description.push(`thickPosition: [${onMouseObject.contig?.thickStart}, ${onMouseObject.contig?.thickEnd}]`);
        }

        p5.text(description.join("\n"), onMouseObject.position, 0);
      }
    };

    p5.mouseMoved = () => {
      if (!roulette.value) {
        return;
      }

      const marks = roulette.value.getMarks();

      for (const mark of marks) {
        // false warning
        // noinspection SuspiciousTypeOfGuard
        if (mark instanceof RouletteLongObject && mark.contig && mark.in(p5.mouseX)) {
          onMouseObject = mark;
          return;
        }
      }

      onMouseObject = undefined;
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
