<template>
  <div class="toolbar-outer">
    <div class="toolbar-upper">
      <FirstBlock></FirstBlock>
      <RearrangementButtons
        :map-manager="props.mapManager"
      ></RearrangementButtons>
      <ScaffoldingButtons :map-manager="props.mapManager"></ScaffoldingButtons>
      <ThirdBlock></ThirdBlock>
    </div>
    <div class="toolbar-bottom">
      <BottomButtons></BottomButtons>
    </div>
  </div>
</template>

<script setup lang="ts">
import FirstBlock from "@/app/ui/components/toolbar/upper_blocks/FirstBlock.vue";
import ThirdBlock from "@/app/ui/components/toolbar/upper_blocks/ThirdBlock.vue";
import BottomButtons from "@/app/ui/components/toolbar/bottom_blocks/BottomButtons.vue";
import type { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";
import RearrangementButtons from "./upper_blocks/RearrangementButtons.vue";
import ScaffoldingButtons from "./upper_blocks/ScaffoldingButtons.vue";

const props = defineProps<{
  readonly mapManager?: ContactMapManager | undefined;
}>();
</script>

<style scoped>
.toolbar-outer {
  /* Auto layout */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 16px 4px;
  gap: 6px;

  /*position: absolute;*/
  position: absolute;
  float: left;
  width: 60px;
  height: 915px;
  left: 0px;
  top: 109px;

  /* Global/07. Light */
  background: #f8f9fa;

  /* Shadows/02. Regular */
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.15);
}

.toolbar-upper {
  /* upper block */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 24px;

  width: 44px;
  height: 356px;

  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

.toolbar-bottom {
  margin-bottom: 16px;
}
</style>
