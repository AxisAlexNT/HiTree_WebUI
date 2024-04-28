<template>
  <nav class="navbar-bar navbar navbar-expand navbar-light bg-light">
    <div class="container-fluid">
      <!-- Logo -->
      <a class="navbar-brand" href="#">HiCT</a>

      <div id="navbarSupportedContent" class="collapse navbar-collapse">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <!-- File -->
          <li class="nav-item dropdown">
            <a
              class="nav-link active dropdown-toggle"
              data-bs-toggle="dropdown"
              href="#"
              >File</a
            >
            <ul class="dropdown-menu">
              <li>
                <a class="dropdown-item" href="#" @click="onOpenFile"
                  >Open...</a
                >
              </li>
              <!-- <li>
                <a class="dropdown-item" href="#" @click="onSaveClicked">Save</a>
                <div v-if="saving" class="spinner-border ms-auto" role="status"></div>
              </li> -->
              <li>
                <a class="dropdown-item" href="#" @click="onCloseClicked"
                  >Close</a
                >
              </li>
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  @click="onConvertCoolersClicked"
                  >Convert Coolers</a
                >
              </li>
            </ul>
          </li>
          <!-- View -->
          <li class="nav-item dropdown">
            <a
              class="nav-link active dropdown-toggle"
              data-bs-toggle="dropdown"
              href="#"
              >View</a
            >
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">Choose color scheme</a></li>
              <li><a class="dropdown-item" href="#">Show borders</a></li>
              <li><a class="dropdown-item" href="#">Something else</a></li>
            </ul>
          </li>
          <!-- Bookmarks -->
          <li class="nav-item">
            <a aria-current="page" class="nav-link active" href="#"
              >Bookmarks</a
            >
          </li>
          <!-- Assembly -->
          <li class="nav-item dropdown">
            <a
              class="nav-link active dropdown-toggle"
              data-bs-toggle="dropdown"
              href="#"
              >Assembly</a
            >
            <ul class="dropdown-menu">
              <li>
                <a class="dropdown-item" href="#" @click="onOpenFASTAFile"
                  >Link FASTA</a
                >
              </li>
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  @click="onAssemblyFASTARequest"
                  >Export assembly</a
                >
              </li>
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  @click="onSelectionFASTARequest"
                  >Export FASTA for selection</a
                >
              </li>
              <li>
                <a class="dropdown-item" href="#" @click="onLoadAGP"
                  >Load AGP</a
                >
              </li>
              <li>
                <a class="dropdown-item" href="#" @click="onAssemblyAGPRequest"
                  >Export to AGP</a
                >
              </li>
            </ul>
          </li>
          <!-- Dev -->
          <li class="nav-item">
            <a aria-current="page" class="nav-link active" href="#">Dev</a>
          </li>
          <!-- Connection settings -->
          <li class="nav-item dropdown">
            <a
              aria-current="page"
              class="nav-link active dropdown-toggle"
              data-bs-toggle="dropdown"
              href="#"
              >Connection</a
            >
            <ul class="dropdown-menu" id="connection-settings-menu-dropdown">
              <li id="connection-settings-input-group" class="input-group m-3">
                <input
                  id="global-search-input"
                  class="form-control m-0"
                  placeholder="http://localhost:5000/"
                  type="text"
                  v-model="gatewayAddress"
                />
                <button
                  class="btn btn-sm btn-outline-dark"
                  id="set-gateway-btn"
                  @click="onGatewayChanged"
                >
                  Set API gateway
                </button>
              </li>
            </ul>
          </li>
          <!-- Report a bug -->
          <li class="nav-item">
            <a
              aria-current="page"
              class="nav-link active"
              href="https://github.com/ctlab/HiCT/issues"
              >Report a bug</a
            >
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <!-- <OpenFileSelector
    :network-manager="props.networkManager"
    v-if="openingFile"
    @selected="onFileSelected"
    @dismissed="onFileDismissed"
  ></OpenFileSelector> -->
  <UniversalFileSelector
    :network-manager="props.networkManager"
    v-if="openingFile"
    @selected="onFileSelected"
    @dismissed="onFileDismissed"
    :error-message="errorMessage"
  ></UniversalFileSelector>
  <UniversalFileSelector
    :network-manager="props.networkManager"
    v-if="openingFASTAFile"
    @selected="linkFASTA"
    @dismissed="onFASTAFileDismissed"
    :error-message="errorMessage"
    :file-name-predicate="(name: string) => name.endsWith('.fasta') || name.endsWith('.fa')"
  ></UniversalFileSelector>
  <UniversalFileSelector
    :network-manager="props.networkManager"
    v-if="openingAGPFile"
    @selected="openAGP"
    @dismissed="onAGPFileDismissed"
    :error-message="errorMessage"
    :file-name-predicate="(name: string) => name.endsWith('.agp')"
  ></UniversalFileSelector>
  <CoolerConverter
    :network-manager="networkManager"
    v-if="convertingCoolers"
    @dismissed="onConvertCoolersDismissed"
  >
  </CoolerConverter>
</template>

<script setup lang="ts">
import type { NetworkManager } from "@/app/core/net/NetworkManager.js";
import OpenFileSelector from "@/app/ui/components/upper_ribbon/OpenFileSelector.vue";
import FASTAFileSelector from "@/app/ui/components/upper_ribbon/FASTAFileSelector.vue";
import AGPFileSelector from "@/app/ui/components/upper_ribbon/AGPFileSelector.vue";
import { Ref, ref, watch } from "vue";
import type { NetworkManager } from "@hict/app/core/net/NetworkManager.js";
import OpenFileSelector from "@hict/app/ui/components/upper_ribbon/OpenFileSelector.vue";
import FASTAFileSelector from "@hict/app/ui/components/upper_ribbon/FASTAFileSelector.vue";
import AGPFileSelector from "@hict/app/ui/components/upper_ribbon/AGPFileSelector.vue";
import {
  GetAGPForAssemblyRequest,
  GetFastaForAssemblyRequest,
  LinkFASTARequest,
  LoadAGPRequest,
} from "@hict/app/core/net/api/request";
import { ContactMapManager } from "@hict/app/core/mapmanagers/ContactMapManager";
import CoolerConverter from "./CoolerConverter.vue";
import UniversalFileSelector from "@hict/app/ui/components/upper_ribbon/UniversalFileSelector.vue";
import { toast } from "vue-sonner";
const openingFile = ref(false);
const openingFASTAFile = ref(false);
const openingAGPFile = ref(false);
const convertingCoolers = ref(false);
const saving = ref(false);
const gatewayAddress: Ref<string> = ref("http://localhost:5000/");

const emit = defineEmits<{
  (e: "selected", filename: string): void;
  (e: "closed"): void;
}>();

const props = defineProps<{
  networkManager: NetworkManager;
  mapManager?: ContactMapManager;
}>();

const errorMessage: Ref<unknown | null> = ref(null);

function onOpenFile() {
  openingFile.value = true;
}

function onLoadAGP() {
  openingAGPFile.value = true;
}

function onFileDismissed() {
  openingFile.value = false;
  errorMessage.value = null;
}

function onSaveClicked(): void {
  saving.value = true;
  props.networkManager.requestManager.save().finally(() => {
    saving.value = false;
  });
}

function onCloseClicked(): void {
  emit("closed");
  errorMessage.value = null;
}

function onConvertCoolersClicked(): void {
  convertingCoolers.value = true;
}

function onConvertCoolersDismissed(): void {
  convertingCoolers.value = false;
}

function onOpenFASTAFile() {
  openingFASTAFile.value = true;
}

function onFASTAFileDismissed() {
  openingFASTAFile.value = false;
}

function onGatewayChanged() {
  props.networkManager.onHostChanged(gatewayAddress.value);
}

function onAGPFileDismissed() {
  openingAGPFile.value = false;
}

function onFileSelected(filename: string) {
  if (filename && filename !== "") {
    if (filename.endsWith(".hict") || filename.endsWith(".hict.hdf5")) {
      openingFile.value = false;
      emit("selected", filename);
    } else if (filename.endsWith(".agp")) {
      openAGP(filename);
    } else if (filename.endsWith(".fasta") || filename.endsWith(".fa")) {
      linkFASTA(filename);
    } else {
      errorMessage.value = "Unknown type of file to be opened: " + filename;
      toast.error("errorMessage.value");
    }
  }
}

function openAGP(filename: string) {
  props.networkManager.requestManager
    .loadAGP(new LoadAGPRequest({ agpFilename: filename }))
    .then(() => {
      openingFile.value = false;
      openingAGPFile.value = false;
      errorMessage.value = null;
      toast.message("Assembly loaded from AGP file " + filename);
    })
    .catch((e) => {
      errorMessage.value = e;
    });
}

function linkFASTA(filename: string) {
  props.networkManager.requestManager
    .linkFASTA(new LinkFASTARequest({ fastaFilename: filename }))
    .then(() => {
      openingFile.value = false;
      openingFASTAFile.value = false;
      errorMessage.value = false;
      toast.message("Linked FASTA file " + filename);
    })
    .catch((e) => {
      errorMessage.value = e;
    });
}

watch(
  () => errorMessage.value,
  (message) => {
    if (message) {
      toast.error(message);
    }
  }
);

function onFASTAFileSelected() {
  openingFASTAFile.value = false;
}

function onAGPFileSelected() {
  openingAGPFile.value = false;
}

function onAssemblyFASTARequest() {
  props.networkManager.requestManager
    .getFASTAForAssembly(new GetFastaForAssemblyRequest())
    .then((data) => {
      // eslint-disable-next-line
      const blob = new Blob([data as BlobPart], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `assembly.fasta`;
      link.click();
    });
}

function onSelectionFASTARequest() {
  props.mapManager?.eventManager.onExportFASTAForSelectionClicked();
}

function onAssemblyAGPRequest() {
  props.networkManager.requestManager
    .getAGPForAssembly(new GetAGPForAssemblyRequest())
    .then((data) => {
      // eslint-disable-next-line
      const blob = new Blob([data as BlobPart], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `assembly.agp`;
      link.click();
    });
}
</script>

<style scoped>
.navbar-bar {
  /* Navbar */

  /* Auto layout */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;

  /* width: 1440px; */
  width: 100%;
  height: 56px;

  /* Global/07. Light */
  background: #f8f9fa;

  /* Shadows/02. Regular */
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.15);

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

#connection-settings-menu-dropdown {
  width: 400%;
}

#set-gateway-btn {
  margin-right: 30px;
}
</style>
