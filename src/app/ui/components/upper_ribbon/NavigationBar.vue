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
              <li>
                <a class="dropdown-item" href="#" @click="onSaveClicked"
                  >Save</a
                >
                <div
                  v-if="saving"
                  class="spinner-border ms-auto"
                  role="status"
                ></div>
              </li>
              <li><a class="dropdown-item" href="#">Close</a></li>
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
                <a class="dropdown-item" href="#" @click="onAssemblyRequest"
                  >Export assembly</a
                >
              </li>
              <li>
                <a class="dropdown-item" href="#">Export FASTA for selection</a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click="onLoadAGP"
                  >Load AGP</a
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
            <a aria-current="page" class="nav-link active" href="#"
              >Report a bug</a
            >
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <OpenFileSelector
    :network-manager="props.networkManager"
    v-if="openingFile"
    @selected="onFileSelected"
    @dismissed="onFileDismissed"
  ></OpenFileSelector>
  <FASTAFileSelector
    :network-manager="props.networkManager"
    v-if="openingFASTAFile"
    @selected="onFASTAFileSelected"
    @dismissed="onFASTAFileDismissed"
  ></FASTAFileSelector>
  <AGPFileSelector
    :network-manager="props.networkManager"
    v-if="openingAGPFile"
    @selected="onAGPFileSelected"
    @dismissed="onAGPFileDismissed"
  ></AGPFileSelector>
</template>

<script setup lang="ts">
import type { NetworkManager } from "@/app/core/net/NetworkManager.js";
import OpenFileSelector from "@/app/ui/components/upper_ribbon/OpenFileSelector.vue";
import FASTAFileSelector from "@/app/ui/components/upper_ribbon/FASTAFileSelector.vue";
import AGPFileSelector from "@/app/ui/components/upper_ribbon/AGPFileSelector.vue";
import { Ref, ref } from "vue";
import { GetFastaForAssemblyRequest } from "@/app/core/net/api/request";
const openingFile = ref(false);
const openingFASTAFile = ref(false);
const openingAGPFile = ref(false);
const saving = ref(false);
const gatewayAddress: Ref<string> = ref("http://localhost:5000/");

const emit = defineEmits<{
  (e: "selected", filename: string): void;
}>();

const props = defineProps<{
  networkManager: NetworkManager;
}>();

function onOpenFile() {
  openingFile.value = true;
}

function onLoadAGP() {
  openingAGPFile.value = true;
}

function onFileDismissed() {
  openingFile.value = false;
}

function onSaveClicked(): void {
  saving.value = true;
  props.networkManager.requestManager.save().finally(() => {
    saving.value = false;
  });
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
  openingFile.value = false;
  if (filename && filename !== "") {
    emit("selected", filename);
  }
}

function onFASTAFileSelected() {
  openingFASTAFile.value = false;
}

function onAGPFileSelected() {
  openingFASTAFile.value = false;
}

function onAssemblyRequest() {
  props.networkManager.requestManager
    .getFASTAForAssembly(new GetFastaForAssemblyRequest())
    .then((data) => {
      const blob = new Blob([data as BlobPart], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `assembly.fasta`;
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

  width: 1440px;
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
