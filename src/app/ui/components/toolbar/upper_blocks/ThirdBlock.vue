<template>
  <div class="block-of-buttons">
    <button class="btn btn-outline-primary" type="button">
      <i class="bi bi-bookmark-plus"></i>
    </button>
    <button class="btn btn-outline-primary" type="button">
      <i class="bi bi-trash"></i>
    </button>
    <button class="btn btn-outline-primary" type="button">
      <i class="bi bi-crop"></i>
    </button>
    <button class="btn btn-outline-primary" type="button">
      <i class="bi bi-plus-lg"></i>
    </button>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.block-of-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
