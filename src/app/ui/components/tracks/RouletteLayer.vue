<template>
  <div class="roulette-layer" :id="props.componentName + '_' + props.name"></div>
</template>

<script setup lang="ts">
import { Roulette, RouletteLayer } from "@/app/core/roulette/Roulette";
import P5 from "p5";
import { drawRoulette } from "@/app/ui/components/tracks/AbstractRouletteBrowser";
import { onMounted, onUpdated, ref, watch } from "vue";
import { Vector } from "@/app/core/roulette/tuple";

const props = defineProps<{
  roulette: Roulette;
  layer: RouletteLayer;
  componentName: string;
  name: string;
}>();

let previous = 0;


const update_condition: () => boolean = () => {
  const res = props.roulette.state.offset === previous;
  previous = props.roulette.state.offset;

  return res;
};

const height = 50;

const sketch = ref((p5: P5) => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  p5.setup = () => { };
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  p5.draw = () => { };
});

const hook = () => {
  const newDiv = document.getElementById(
    `${props.componentName}_${props.name}`
  );

  if (!newDiv) {
    alert(
      `FAILED: "newDiv" in RouletteLevel.vue for "${props.componentName}_${props.name}"`
    );
    return;
  }

  setupLayer(newDiv as HTMLDivElement);
};

onMounted(hook);
onUpdated(hook);

function setupLayer(newDiv: HTMLDivElement) {
  const roulette = props.roulette;
  const layer = props.layer;
  if (!roulette || !layer) {
    return;
  }

  updateSketch(newDiv);

  watch(
    () => roulette.initialized,
    (isInit) => {
      if (!isInit) {
        return;
      }

      initializeLayer(newDiv);
    }
  );

  // fixme hack: if already initialized
  if (roulette.initialized) {
    initializeLayer(newDiv);
  }
}




function updateSketch(newDiv: HTMLDivElement) {
  const width = newDiv.parentElement?.offsetWidth ?? newDiv.offsetWidth;

  sketch.value = (p5: P5) => {
    p5.setup = () => {
      const canvas = p5.createCanvas(width, height);
      canvas.parent(newDiv);
    };

    // let onMouseObject: OnMouseObject | undefined = undefined;


    p5.draw = () => {
      if (!update_condition()) {
        return;
      }

      drawRoulette(props.layer, p5);
      // console.log('hello')
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

function initializeLayer(newDiv: HTMLDivElement) {
  const width = newDiv.parentElement?.offsetWidth ?? newDiv.offsetWidth;

  props.layer.setLayerConfig(new Vector(0, (height * 3) / 4), width);

  new P5(sketch.value);
}
</script>

<style scoped>
.roulette-layer {
  width: 100%;
  height: 50px;
}
</style>
