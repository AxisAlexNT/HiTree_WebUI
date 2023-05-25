<template>
  <div id="vertical-p5-div"
       style="height: auto; min-height: 100%; /*overflow: auto*/ width: 100px">
  </div>
<!--  <div id="vertical-igv-track-div">-->
<!--    <figure class="text-center vertical">-->
<!--      <blockquote class="blockquote">-->
<!--        <p>Very soon horizontal IGV tracks will be here.</p>-->
<!--      </blockquote>-->
<!--      <figcaption class="blockquote-footer">-->
<!--        Someone famous in the <cite title="HiCT Development Team">HiCT Development Team</cite>-->
<!--      </figcaption>-->
<!--    </figure>-->
<!--  </div>-->
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
///<reference path="../../../../../node_modules/igv/dist/igv.esm.js" />
import igv from "igv";
import { Browser } from "igv";
import { onMounted, ref, Ref, watch } from "vue";
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";
import {
  Contig,
  Interval,
  OnMouseObject,
  Roulette,
  RouletteConfig,
  Vector
} from "@/app/ui/components/tracks/ruler/Roulette";
import P5 from "p5";
import { ContigDirection } from "@/app/core/domain/common";
import { BedFormatParser, EMPTY_TRACK, TracksHolder } from "@/app/ui/components/tracks/ruler/bed-format-parser";

const props = defineProps<{
  mapManager: ContactMapManager | undefined;
  trackHolder: TracksHolder | undefined;
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
          .initVerticalRoulette(roulette.value);
        roulette.value.init();
        roulette.value.invalidate(1);

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
            .pixelResolution;

        const size = Math.round(baseLength * (pixelResolution / newResolution));

        roulette.value?.zoom(pixel[1], size);
      }
    );
  }
);

onMounted(() => {
  const newDiv = document.getElementById("vertical-p5-div");
  if (!newDiv) {
    alert("FAILED: `newDiv` in VerticalIGVTrack.vue");
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

    return new Contig(
      new Interval(prefixes[l], prefixes[l + 1]),
      props.mapManager?.contigDimensionHolder.contigDescriptors.map(
        (cd) => cd.direction
      )[l] == ContigDirection.REVERSED
    );
  };

  const defaultTrackHolder = new BedFormatParser(EMPTY_TRACK, "unknown").parse();

  roulette.value = new Roulette(
    new RouletteConfig(
      new Vector((WIDTH * 2) / 4, offset),
      HEIGHT,
      false,
      (e) =>
        props.mapManager?.contigDimensionHolder.getStartBpOfPx(
          e,
          props.mapManager?.viewAndLayersManager.currentViewState
            .resolutionDesciptor.bpResolution
        ) ?? HEIGHT,
      (e) =>
        props.mapManager?.contigDimensionHolder.getPxContainingBp(
          e,
          props.mapManager?.viewAndLayersManager.currentViewState
            .resolutionDesciptor.bpResolution
        ) ?? 0,
      acceptContig,
      props.trackHolder ?? defaultTrackHolder
    ),
    HEIGHT
  );

  const sketch = (p5: P5) => {
    p5.setup = () => {
      const canvas = p5.createCanvas(WIDTH, HEIGHT + 2 * offset);
      canvas.parent(newDiv);

      p5.background("white");
    };

    let onMouseObject: OnMouseObject | undefined = undefined;

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
        (p, t) => {
          p5.push();
          p5.translate(p.x, p.y);
          p5.rotate(p5.radians(270));
          p5.text(t + "bp", 0, 20);
          p5.pop();
        },
        (p) => p5.line(p.x - 5, p.y, p.x + 5, p.y),
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

      if (!props.trackHolder) {
        return;
      }

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

        if (props.trackHolder.fieldCount >= 4) {
          description.push(`Name: ${onMouseObject.contig?.name}`);
        }
        if (props.trackHolder.fieldCount >= 5) {
          description.push(`Score: ${onMouseObject.contig?.score}`);
        }
        if (props.trackHolder.fieldCount >= 8) {
          description.push(`Thick position: [${onMouseObject.contig?.thickStart}, ${onMouseObject.contig?.thickEnd}]`);
        }

        // p5.text(description.join("\n"), onMouseObject.position.x, 0);
      }
    };

    p5.mouseMoved = () => {
      if (!roulette.value) {
        return;
      }

      onMouseObject = roulette.value?.findOnMouse(p5.mouseY);
    };
  };

  new P5(sketch);

  console.log("Vertical roulette:", roulette);

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

// const igvOptions = {
//   genome: "hg38",
//   locus: "chr8:127,736,588-127,739,371",
//   tracks: [
//     {
//       name: "HG00103",
//       url: "https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram",
//       indexURL:
//         "https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram.crai",
//       format: "cram",
//     },
//   ],
// };
//
// watch(
//   () => document.getElementById("vertical-igv-track-div"),
//   (newDiv) => {
//     console.log("New div is", newDiv);
//     if (newDiv) {
//       igv.createBrowser(newDiv, igvOptions).then(function () {
//         console.log("Created Horizontal IGV browser");
//       });
//     }
//   }
// );
//
// onMounted(() => {
//   const newDiv = undefined;//document.getElementById("vertical-igv-track-div");
//
//   if (newDiv) {
//     console.log("New div is", newDiv);
//     igv.createBrowser(newDiv, igvOptions).then(function (browser: Browser) {
//       console.log("Created Vertical IGV browser");
//
//       document.getElementsByClassName("igv-container")[1].class += "vertical";
//
//       removeUseless([
//         // "igv-axis-column",
//         "igv-navbar",
//         "igv-track-drag-column",
//         "igv-gear-menu-column",
//         "igv-scrollbar-column",
//       ]);
//
//       const divs =
//         document.getElementsByClassName("igv-axis-column")[0].children;
//
//       for (let i = 2; i < divs.length; i++) {
//         divs[i].style.display = "none";
//       }
//
//       removeUseless(["igv-viewport"], 2);
//
//       props.mapManager
//         ?.getLayersManager()
//         .initVerticalIgvInteraction(browser);
//
//       // const updated = igvOptions;
//       // updated.locus = "chr8:127,737,000-127,739,000";
//       // browser.search(updated.locus);
//
//       console.log(browser);
//     });
//   }
// });
//
// function removeUseless(useless: Array<string>, from = 0) {
//   for (const item of useless) {
//     const divs = document.getElementsByClassName(item);
//
//     for (let i = from; i < divs.length; i++) {
//       divs[i].style.display = "none";
//     }
//   }
// }
</script>

<style scoped>
#vertical-igv-track-div {
  width: 100%;
  height: 100%;
  /* background-color: lime; */
  border: 1px solid black;
}

.vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}
</style>
