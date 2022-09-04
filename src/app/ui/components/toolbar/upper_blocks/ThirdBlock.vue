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
  /* block of buttons3 */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;

  width: 44px;
  height: 156px;

  /* Inside auto layout */
  flex: none;
  order: 2;
  flex-grow: 0;
}
</style>
