<template>
  Hello
  <div id="vertical-igv-track"></div>
  <div id="horizontal-igv-track"></div>
</template>

<script setup lang="ts">
// @ts-expect-error "The module has no typescript bindings provided"
import igv from "igv";

const vdiv = document.getElementById("vertical-igv-track");
const hdiv = document.getElementById("horizontal-igv-track");

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

igv.createBrowser("vertical-igv-track", options).then((browser) => {
  console.log("Created vertical IGV browser:", browser);
});

igv.createBrowser(hdiv, options).then((browser) => {
  console.log("Created horizontal IGV browser:", browser);
});
</script>

<style scoped></style>
