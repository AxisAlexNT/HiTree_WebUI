<template>
  <div id="horizontal-igv-track-div">
    <!-- <figure class="text-center">
      <blockquote class="blockquote">
        <p>Very soon horizontal IGV tracks will be here.</p>
      </blockquote>
      <figcaption class="blockquote-footer">
        Someone famous in the
        <cite title="HiCT Development Team">HiCT Development Team</cite>
      </figcaption>
    </figure> -->
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
///<reference path="../../../../../node_modules/igv/dist/igv.esm.js" />
import igv from "igv";
import { onMounted } from "vue";

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

// watch(
//   () => document.getElementById("horizontal-igv-track-div"),
//   (newDiv) => {
//     console.log("New div is", newDiv);
//     if (newDiv) {
//       igv.createBrowser(newDiv, igvOptions).then(function () {
//         console.log("Created Horizontal IGV browser");
//       });
//     }
//   }
// );

onMounted(() => {
  const newDiv = document.getElementById("horizontal-igv-track-div");

  if (newDiv) {
    console.log("New div is", newDiv);
    // igv.createBrowser(newDiv, igvOptions).then(function () {
    //  console.log("Created Horizontal IGV browser");
    // });
  }
});
</script>

<style scoped>
#horizontal-igv-track-div {
  /* background-color: blue; */
  width: 100%;
  height: 100%;
  border: 1px solid black;
}
</style>
