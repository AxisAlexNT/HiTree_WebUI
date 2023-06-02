<template>
  <div class="roulette-layer" :id="props.name"></div>
</template>

<script setup lang="ts">
import { Roulette, RouletteLayer } from "@/app/core/roulette/Roulette";
import P5 from "p5";
import { drawRoulette } from "@/app/ui/components/tracks/AbstractRouletteBrowser";
import { onMounted, onUpdated, ref, watch } from "vue";

const props = defineProps<{
  roulette: Roulette | undefined;
  layer: RouletteLayer<never> | undefined;
  name: string;
}>();

const sketch = ref((p5: P5) => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  p5.setup = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  p5.draw = () => {};
});

const hook = () => {
  const newDiv = document.getElementById(props.name);
  if (!newDiv) {
    alert(`FAILED: "newDiv" in RouletteLevel.vue for "${props.name}"`);
    return;
  }

  // watch(
  //   () => props.roulette,
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   (updated, _) => {
  //     if (!updated) {
  //       return;
  //     }
  //
  //     setupLayer(newDiv);
  //   }
  // );

  setupLayer(newDiv);
};

onMounted(() => {
  hook();

  new P5(sketch.value);
});
onUpdated(hook);

function setupLayer(newDiv: Element) {
  const roulette = props.roulette;
  const layer = props.layer;
  if (!roulette || !layer) {
    return;
  }

  const width = newDiv.getBoundingClientRect().width;
  const height = newDiv.getBoundingClientRect().height;

  sketch.value = (p5: P5) => {
    p5.setup = () => {
      const canvas = p5.createCanvas(width, height);
      canvas.parent(newDiv);
    };

    // let onMouseObject: OnMouseObject | undefined = undefined;

    p5.draw = () => {
      drawRoulette(layer, p5);
      p5.push()
      p5.line(0, 0, width, height);
      p5.pop()

      // if (!props.trackHolder) {
      //   return;
      // }
      //
      // if (onMouseObject) {
      //   // "chromosome",
      //   // "start",
      //   // "end",
      //   // "name",
      //   // "score",
      //   // "strand",
      //   // "thickStart",
      //   // "thickEnd",
      //   // "itemRgb",
      //   // "blockCount",
      //   // "blockSize",
      //   // "blockStarts",
      //
      //   const description = [];
      //
      //   p5.textAlign("left", "top");
      //
      //   const contig = onMouseObject.contig;
      //   const contPos = rlt.collapseLength(contig.start, contig.start);
      //   const contSize = rlt.collapseLength(contig.end - contig.start, contig.end);
      //
      //   if (props.trackHolder.fieldCount >= 4) {
      //     description.push(`Name: ${contig?.name}`);
      //   }
      //   description.push(`Position: ${contPos.v}${contPos.power}`);
      //   description.push(`Size: ${contSize.v}${contSize.power}`);
      //   if (props.trackHolder.fieldCount >= 5) {
      //     description.push(`Score: ${contig?.score}`);
      //   }
      //   if (props.trackHolder.fieldCount >= 8) {
      //     description.push(`Thick position: [${contig.thickStart}, ${contig.thickEnd}]`);
      //   }
      //
      //   p5.text(description.join("\n"), onMouseObject.position.x, 0);
      // }
    };

    // p5.mouseMoved = () => {
    //   if (!roulette.value) {
    //     return;
    //   }
    //
    //   onMouseObject = roulette.value?.findOnMouse(p5.mouseX);
    // };
  };
}
</script>

<style scoped>
.roulette-layer {
  width: 100%;
  min-height: 3rem;
  border: 1px solid #000000;
  margin: 0;
  padding: 0;
}
</style>
