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
      :trackManagers="trackManagers"
      :filename="filename ?? ''"
      @delete-component="onRouletteComponentDeleted"
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
import { BedParser, TrackManager } from "@/app/core/roulette/BedParser";


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
const trackManagers: Ref<Array<TrackManager>> = ref([]);
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
  if (!fname) {
    throw new Error("Cannot open non-specified files: filename=" + fname);
  }
  networkManager.requestManager
    .loadBedFile(fname, "chr1")
    .then((LoadBedTrackResponse) => {
      mapManager.value?.dispose();
      const bedTrackParser = new BedParser();
      trackManagers.value.push(
        bedTrackParser.parse(fname, LoadBedTrackResponse.tracks)
      );

      console.log("Track holder:", trackManagers.value);
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
  if (!filename.value) {
    alert("You can not load track before the map");
    return;
  }

  if (trackManagers.value.map((t) => t.filename).includes(newFilename)) {
    alert(
      `You have already loaded "${newFilename}". You can not load it twice`
    );
    return;
  }

  bedfilename.value = newFilename;
  if (bedfilename.value && bedfilename.value !== "") {
    parseTrack();
  }
}

function onRouletteComponentDeleted(componentName: string) {
  trackManagers.value = trackManagers.value.filter((tm) => tm.filename !== componentName);
}
</script>

<style scoped>
.main-ui-component {
  width: 100%;
  height: 100vh;
}
</style>
