<template>
  <div id="vertical-igv-track-div">
<!--    <figure class="text-center vertical">-->
<!--      <blockquote class="blockquote">-->
<!--        <p>Very soon horizontal IGV tracks will be here.</p>-->
<!--      </blockquote>-->
<!--      <figcaption class="blockquote-footer">-->
<!--        Someone famous in the <cite title="HiCT Development Team">HiCT Development Team</cite>-->
<!--      </figcaption>-->
<!--    </figure>-->
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
///<reference path="../../../../../node_modules/igv/dist/igv.esm.js" />
import igv from "igv";
import { Browser } from "igv";
import { onMounted, watch } from "vue";
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";

const props = defineProps<{
  mapManager: ContactMapManager | undefined;
}>();

const igvOptions = {
  genome: "hg38",
  locus: "chr8:127,736,588-127,739,371",
  tracks: [
    {
      name: "HG00103",
      url: "https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram",
      indexURL:
        "https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram.crai",
      format: "cram",
    },
  ],
};

watch(
  () => document.getElementById("vertical-igv-track-div"),
  (newDiv) => {
    console.log("New div is", newDiv);
    if (newDiv) {
      igv.createBrowser(newDiv, igvOptions).then(function () {
        console.log("Created Horizontal IGV browser");
      });
    }
  }
);

onMounted(() => {
  const newDiv = undefined;//document.getElementById("vertical-igv-track-div");

  if (newDiv) {
    console.log("New div is", newDiv);
    igv.createBrowser(newDiv, igvOptions).then(function (browser: Browser) {
      console.log("Created Vertical IGV browser");

      document.getElementsByClassName("igv-container")[1].class += "vertical";

      removeUseless([
        // "igv-axis-column",
        "igv-navbar",
        "igv-track-drag-column",
        "igv-gear-menu-column",
        "igv-scrollbar-column",
      ]);

      const divs =
        document.getElementsByClassName("igv-axis-column")[0].children;

      for (let i = 2; i < divs.length; i++) {
        divs[i].style.display = "none";
      }

      removeUseless(["igv-viewport"], 2);

      props.mapManager
        ?.getLayersManager()
        .initVerticalIgvInteraction(browser);

      // const updated = igvOptions;
      // updated.locus = "chr8:127,737,000-127,739,000";
      // browser.search(updated.locus);

      console.log(browser);
    });
  }
});

function removeUseless(useless: Array<string>, from = 0) {
  for (const item of useless) {
    const divs = document.getElementsByClassName(item);

    for (let i = from; i < divs.length; i++) {
      divs[i].style.display = "none";
    }
  }
}
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
