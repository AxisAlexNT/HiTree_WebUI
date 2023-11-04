<template>
  <div
    class="modal fade in"
    id="loadAGPModal"
    ref="loadAGPModal"
    tabindex="-1"
    data-keyboard="false"
    data-backdrop="static"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Select AGP file</h5>
          <button
            type="button"
            class="btn-close"
            @click="onDismissClicked"
          ></button>
        </div>
        <div class="modal-body">
          <div class="d-flex align-items-center" v-if="errorMessage">
            Error: {{ errorMessage }}
          </div>
          <div class="d-flex align-items-center" v-if="loading">
            <strong>Loading...</strong>
            <div class="spinner-border ms-auto" role="status"></div>
          </div>
          <div v-if="!loading">
            <select
              class="form-select form-select-lg mb-3"
              v-model="selectedAGPFilename"
            >
              <option selected>Select AGP file from the list below...</option>
              <option
                v-for="(filename, idx) in filenames"
                :key="idx"
                :value="filename"
              >
                {{ filename }}
              </option>
            </select>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="onDismissClicked"
            >
              Dismiss
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="onSelectClicked"
            >
              Load AGP
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Ref, ref, onMounted } from "vue";
import { Modal } from "bootstrap";
import type { NetworkManager } from "@/app/core/net/NetworkManager.js";
import { LoadAGPRequest } from "@/app/core/net/api/request";
import path from "path-browserify";
import { FileTreeNode, extensionToDataType } from "../ComponentCommon";
import { resolveSrv } from "dns";

interface FinalTreeNode {
  isLeaf: boolean;
  originalPath: string;
}

interface RecursiveStringRecord {
  [index: string]: RecursiveStringRecord | FinalTreeNode;
}

const emit = defineEmits<{
  (e: "selected", agpFilename: string): void;
  (e: "dismissed"): void;
}>();

const props = defineProps<{
  networkManager: NetworkManager;
}>();

const selectedAGPFilename: Ref<string | null> = ref(null);
const filenames: Ref<string[] | null> = ref(null);
const loading: Ref<boolean> = ref(true);
const errorMessage: Ref<unknown | null> = ref(null);
const modal: Ref<Modal | null> = ref(null);

const fileTree: Ref<FileTreeNode | null> = ref(null);

const loadAGPModal = ref<HTMLElement | null>(null);

function recursiveRecordToFileTree(
  r: RecursiveStringRecord | FinalTreeNode,
  parentName: string | undefined
): FileTreeNode {
  if (r) {
    if ("isLeaf" in r) {
      const ftn = r as unknown as FinalTreeNode;
      if (ftn && ftn.isLeaf === true) {
        const originalPath = path.parse(ftn.originalPath);
        return {
          nodeName: originalPath.name,
          dataType: extensionToDataType(originalPath.ext),
          nodeType: "file",
          children: [],
        };
      }
    }
    return {
      nodeName: parentName ?? "ROOT",
      dataType: undefined,
      nodeType: "directory",
      children: Object.entries(r).map(([key, value]) =>
        recursiveRecordToFileTree(value, key)
      ),
    };
  }
  return {
    nodeName: "EMPTY",
    dataType: undefined,
    nodeType: "directory",
    children: [],
  };
}

function getAGPFilenamesList(): void {
  props.networkManager.requestManager
    .listAGPFiles()
    .then((lst) => {
      filenames.value = lst;
      loading.value = false;
      const np = lst.map((s) =>
        path.normalize(s).replaceAll("\\", "/").replaceAll(path.sep, "/")
      );
      const tree: RecursiveStringRecord = {};
      np.forEach((p) => {
        const parts = p.split("/");

        /*
        const preparedHierarchy = parts
          .slice(parts.length - 1, 1)
          .reduce((acc, path_part) => {
            acc[path_part] =
              acc[path_part] ||
              ({
                //isLeaf: true, originalPath: p
              } as FinalTreeNode);
            console.log("acc is", acc, "path_part is", path_part);
            return acc[path_part] as RecursiveStringRecord;
          }, tree);
        */

        let preparedHierarchy = tree;

        parts.slice(0, parts.length - 1).forEach((p) => {
          if (p in preparedHierarchy) {
            const nextNode = preparedHierarchy[p];
            if (!nextNode || "isLeaf" in nextNode) {
              throw new Error(
                `Unexpected hierarchy: ${p} is an existing Leaf in ${preparedHierarchy} but expected to be a Node`
              );
            }
            preparedHierarchy = nextNode;
          } else {
            preparedHierarchy[p] = {};
            preparedHierarchy = preparedHierarchy[p] as RecursiveStringRecord;
          }
        });

        console.log("parts", parts, "preparedHierarchy", preparedHierarchy);

        preparedHierarchy[parts[parts.length - 1]] = {
          isLeaf: true,
          originalPath: p,
        } as FinalTreeNode;
      });
      const ft = recursiveRecordToFileTree(tree, undefined);
      fileTree.value = ft;
      console.log("Path separator:", path.sep);
      console.log("Raw:");
      console.log(lst);
      console.log("Normalized:");
      console.log(np);
      console.log("Tree:");
      console.log(tree);
      console.log("FileTree:");
      console.log(ft);
    })
    .catch((e) => {
      errorMessage.value = e;
      loading.value = false;
    });
}

function resetState(): void {
  try {
    modal.value?.dispose();
  } catch (e: unknown) {
    // Expected
  } finally {
    modal.value = null;
    errorMessage.value = null;
    loading.value = false;
    filenames.value = null;
    selectedAGPFilename.value = null;
  }
}

function onDismissClicked(): void {
  resetState();
  emit("dismissed");
}

function onSelectClicked(): void {
  const selectedAGPFilenameString = selectedAGPFilename.value;
  if (!selectedAGPFilenameString) {
    //onDismissClicked();
    // throw new Error("Selected AGP filename was null?");
    errorMessage.value = "Please, select AGP file";
    return;
  }
  props.networkManager.requestManager
    .loadAGP(new LoadAGPRequest({ agpFilename: selectedAGPFilenameString }))
    .then(() => {
      emit("selected", selectedAGPFilenameString);
      resetState();
    })
    .catch((e) => {
      errorMessage.value = e;
    });
}

onMounted(() => {
  const fns = filenames.value;
  if (fns) {
    fns.length = 0;
  }
  loading.value = true;
  modal.value = new Modal(loadAGPModal.value ?? "loadAGPModal", {
    backdrop: "static",
    keyboard: false,
  });
  modal.value.show();
  getAGPFilenamesList();
});
</script>

<style scoped></style>
