<template>
  <div class="block-of-buttons">
    <button class="btn btn-outline-primary" type="button">
      <i class="bi bi-chevron-left"></i>
    </button>
    <button class="btn btn-outline-primary" type="button">
      <i class="bi bi-terminal"></i>
    </button>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.block-of-buttons {
  /* bottom block */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;

  width: 44px;
  height: 62px;

  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}
</style>
