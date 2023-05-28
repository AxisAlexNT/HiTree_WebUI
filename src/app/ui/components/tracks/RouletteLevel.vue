<template>
  <div id="{{ props.name }}"></div>
</template>

<script setup lang="ts">
import { Roulette } from "@/app/core/roulette/Roulette";
import {
  Contig,
  Interval,
  OnMouseObject,
  RouletteConfig,
  Vector
} from "@/app/ui/components/tracks_deprecated/ruler/Roulette";
import P5 from "p5";
import { drawRoulette } from "@/app/ui/components/tracks/AbstractRouletteBrowser";

const props = defineProps<{
  roulette: Roulette,
  name: string,
}>();

function setupLayer(newDiv: Element) {
  const width = newDiv.getBoundingClientRect().width;
  const height = newDiv.getBoundingClientRect().height;

  const layer = props.roulette.level(props.name);

  const sketch = (p5: P5) => {
    p5.setup = () => {
      const canvas = p5.createCanvas(width, height);
      canvas.parent(newDiv);

      p5.background("white");
    };

    let onMouseObject: OnMouseObject | undefined = undefined;

    p5.draw = () => {
      drawRoulette(layer, p5);

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

        const contig = onMouseObject.contig;
        const contPos = rlt.collapseLength(contig.start, contig.start);
        const contSize = rlt.collapseLength(contig.end - contig.start, contig.end);

        if (props.trackHolder.fieldCount >= 4) {
          description.push(`Name: ${contig?.name}`);
        }
        description.push(`Position: ${contPos.v}${contPos.power}`);
        description.push(`Size: ${contSize.v}${contSize.power}`);
        if (props.trackHolder.fieldCount >= 5) {
          description.push(`Score: ${contig?.score}`);
        }
        if (props.trackHolder.fieldCount >= 8) {
          description.push(`Thick position: [${contig.thickStart}, ${contig.thickEnd}]`);
        }

        p5.text(description.join("\n"), onMouseObject.position.x, 0);
      }
    };

    p5.mouseMoved = () => {
      if (!roulette.value) {
        return;
      }

      onMouseObject = roulette.value?.findOnMouse(p5.mouseX);
    };
  };

  new P5(sketch);
}
</script>

<style scoped>

</style>