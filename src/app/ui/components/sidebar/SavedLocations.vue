<template>
  <div class="pills">
    <div class="btn-group" role="group">
      <input
        id="saved-btn"
        autocomplete="off"
        checked
        class="btn-check"
        name="btnradio"
        type="radio"
      />
      <label class="btn btn-outline-primary" for="saved-btn">Saved</label>

      <input
        id="unplaced-btn"
        autocomplete="off"
        class="btn-check"
        name="btnradio"
        type="radio"
      />
      <label class="btn btn-outline-primary" for="unplaced-btn">Unplaced</label>
    </div>
  </div>

  <div class="save-btn-div">
    <button id="save-button" class="btn btn-outline-primary" type="button">
      <i class="bi bi-bookmark-plus"></i>
      <span id="save-btn-text">Save</span>
    </button>
  </div>
  <div class="saved-locations-div"></div>
</template>

<script setup lang="ts"></script>

<style scoped>
.pills {
  /* pills */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px 16px;
  gap: 10px;

  width: 80%;
  height: 40px;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

.save-btn-div {
  /* save btn */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 16px 0px;

  width: 232px;
  height: 37px;

  /* Inside auto layout */
  flex: none;
  order: 1;
  flex-grow: 0;
}

#save-button {
  /* Buttons */
  width: 200px;

  /* Inside auto layout */
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
}

#save-btn-text {
  margin-left: 10px;
}
</style>
