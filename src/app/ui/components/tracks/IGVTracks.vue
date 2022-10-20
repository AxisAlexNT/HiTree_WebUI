<template>
  Hello
  <div id="vertical-igv-track-div"></div>
  <div id="horizontal-igv-track-div"></div>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
///<reference path="../../../../../node_modules/igv/dist/igv.esm.js" />
import igv from "igv";
import { onMounted } from "vue";

const options = {
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

onMounted(() => {
  const igvDiv = document.getElementById("vertical-igv-track-div");
  console.log("mounted() with igvDiv", igvDiv);
  // igv.createBrowser(igvDiv, options).then(function (browser) {
  //   console.log("Created IGV browser in div", igvDiv);
  // });
});
</script>

<style scoped>
#horizontal-igv-track-div {
  /* horizontal rulers */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;

  position: absolute;
  width: 1020px;
  height: 128px;
  left: 188px;
  top: 109px;
  background-color: black;
}

#vertical-igv-track-div {
  /* vertical rulers */

  /* Auto layout */
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;

  position: absolute;
  /* width: 129px; */
  width: 10%;
  height: 847px;
  left: 60px;
  top: 177px;
  background-color: black;
}
</style>
