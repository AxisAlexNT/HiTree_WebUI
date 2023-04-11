<template>
  <a class="nav-link active dropdown-toggle" data-bs-toggle="dropdown" href="#">
    <i class="bi bi-pencil edit-btn"></i>
    <!--@click="onEditLayer"-->
  </a>
  <ul class="dropdown-menu">
    <li>
      <a class="dropdown-item" href="#" @click="onWeightChanged">Weight</a>
    </li>
  </ul>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "onWeightChanged", weight: number): void;
}>();

function onEditLayer() {
  alert("Edit layer?");
}

function onWeightChanged() {
  emit("onWeightChanged", 10);
}
</script>

<style scoped></style>
