<template>
  <div class="main-ui-component">
    <UpperFrame
      :networkManager="networkManager"
      :mapManager="mapManager"
      @selected="onFileSelected"
      @bedtrack="onBedTrackSelected"
    ></UpperFrame>
    <WorkspaceComponent
      :mapManager="mapManager"
      :trackManager="trackManager"
      :filename="filename"
    ></WorkspaceComponent>
  </div>
</template>

<script setup lang="ts">
import UpperFrame from "@/app/ui/components/upper_ribbon/UpperFrame.vue";
import {
  ContactMapManager,
  // type ContactMapManagerOptions,
} from "@/app/core/mapmanagers/ContactMapManager";
import { ref, watch, type Ref } from "vue";
import { NetworkManager } from "@/app/core/net/NetworkManager";

import WorkspaceComponent from "@/app/ui/components/workspace/WorkspaceComponent.vue";
import { BedFormatParser, TracksHolder } from "@/app/ui/components/tracks/ruler/bed-format-parser";

// Reactively use these refs only inside component
// Pass them to Map Manager on creation as values, not Refs as objects
// Get notifications about state change using event handlers in MainComponent
// Change values in managers using their callbacks and watches in MainComponent

const filename: Ref<string | undefined> = ref("");
const fastaFilename: Ref<string | undefined> = ref("");
const tileSize: Ref<number> = ref(256);
const contigBorderColor: Ref<string> = ref("ffccee");
const mapManager: Ref<ContactMapManager | undefined> = ref(undefined);
const bedfilename: Ref<string | undefined> = ref("");
const chromosome: Ref<string | undefined> = ref("");
const trackManager: Ref<TracksHolder | undefined> = ref(undefined);
const networkManager: NetworkManager = new NetworkManager(
  "http://localhost:5000/",
  undefined
);

function displayNewMap() {
  const fname = filename.value;
  const ffname = fastaFilename.value;
  if (!fname) {
    throw new Error(
      "Cannot open non-specified files: filename=" +
        fname +
        " fastaFilename=" +
        ffname
    );
  }
  networkManager.requestManager
    .openFile(fname, ffname)
    .then((openFileResponse) => {
      mapManager.value?.dispose();
      const newManager = new ContactMapManager({
        response: openFileResponse,
        filename: fname,
        fastaFilename: ffname ?? "",
        tileSize: tileSize.value,
        contigBorderColor: contigBorderColor.value,
        mapTargetSelector: "hic-contact-map",
        networkManager: networkManager,
      });
      mapManager.value = newManager;
      networkManager.mapManager = mapManager.value;
      newManager.initializeMap();
    })
    .catch(console.log);
}

function parseTrack() {
  const fname = bedfilename.value;
  const chr = chromosome.value;
  // TODO chromosome selection
  if (!fname /*|| !chr*/) {
    throw new Error(
      "Cannot open non-specified files: filename=" +
        fname +
        " for chromosome=" +
        chr
    );
  }
  networkManager.requestManager
    .loadBedFile(fname, chr)
    .then((LoadBedTrackResponse) => {
      mapManager.value?.dispose();
      const bedTrackParser = new BedFormatParser(
        LoadBedTrackResponse.tracks,
        "chr1"
      );
      trackManager.value = bedTrackParser.parse();
    })
    .catch(console.log);
}

watch(
  () => tileSize.value,
  (newTileSize, oldTileSize) => {
    if (newTileSize && newTileSize !== oldTileSize) {
      mapManager.value?.getLayersManager().onTileSizeChanged(newTileSize);
    }
  }
);

watch(
  () => contigBorderColor.value,
  (newContigBorderColor, oldContigBorderColor) => {
    if (newContigBorderColor && newContigBorderColor !== oldContigBorderColor) {
      mapManager.value
        ?.getLayersManager()
        .onContigBorderColorChanged(newContigBorderColor);
    }
  }
);

function onFileSelected(newFilename: string) {
  if (newFilename !== filename.value) {
    filename.value = newFilename;
    mapManager.value?.dispose();
    if (filename.value && filename.value !== "") {
      displayNewMap();
    }
  }
}

function onBedTrackSelected(newFilename: string) {
  if (newFilename !== bedfilename.value) {
    bedfilename.value = newFilename;
    if (bedfilename.value && bedfilename.value !== "") {
      parseTrack();
    }
  }
}
</script>

<style scoped>
.main-ui-component {
  width: 100%;
  height: 100vh;
}
</style>
