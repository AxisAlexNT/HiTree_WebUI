<template>
  <div class="roulette-component" id="props.name">
    <div class="header">
      <div v-if="!this.visible">{{ props.name }}</div>
      <div v-if="this.visible" class="nav">
        <span
          v-for="[name, enabled] of this.layerNames()"
          :key="name"
          :class="enabled ? 'layer-enabled' : 'layer-disabled'"
          @click="this.enable(name)"
        >{{ name }}</span>
      </div>

      <span class="escape" @click="this.hide()">X</span>
    </div>
    <div v-if="this.visible">
      <RouletteLayer
        v-for="layer of this.layers()"
        :key="layer.name"
        :roulette="props.roulette"
        :layer="layer"
        :name="layer.name"
        :component-name="props.name"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Roulette, RouletteComponent } from "@/app/core/roulette/Roulette";
import RouletteLayer from "@/app/ui/components/tracks/RouletteLayer.vue";

const props = defineProps<{
  roulette: Roulette;
  component: RouletteComponent;
  name: string;
}>();

// FIXME same name import: any -> roulette/RouletteLayer<never>
// eslint-disable-next-line
// const showing: Map<any, boolean> = [...props.component?.layers.values() ?? []].map((l) => [true, l]) ?? new Map();

const showing: Set<string> = new Set();
let visible = true;

// fail warning
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function enable(layerName: string) {
  if (layerName in showing) {
    showing.delete(layerName);
  } else {
    showing.add(layerName);
  }
}

function hide() {
  visible = !visible;
}

// eslint-disable-next-line
function layers() {
  return Array.from(props.component.layers ?? new Map())
    .filter(([name, _]) => showing.has(name))
    .map(([_, layer]) => layer);
}

function layerNames() {
  return Array.from(props.component.layers ?? new Map())
    .map(([name, _]) => [name, showing.has(name)]);
}
// eslint-enable
</script>

<style>
html {
  --border-color: #00cccc;
  --bg-color: #00cccc88;
  --enabled-color: #0044cc;
  --disabled-color: #888888;
  --escape-color: #cc0000;
}

.roulette-component {
  width: 100%;
  min-height: 3rem;
  border: 2px solid var(--border-color);
  border-radius: 1rem;
  background-color: var(--bg-color);
  margin: 0.2rem;
  padding: 0.5rem;
}

.roulette-component > .header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.roulette-component > .header > .nav {
  display: flex;
  flex-direction: row;
  justify-content: left;
}

.roulette-component > .header > .nav > .layer-enabled {
  color: var(--enabled-color);
  border-bottom: 1px solid var(--enabled-color);
}

.roulette-component > .header > .nav > .layer-disabled {
  color: var(--disabled-color);
}

.roulette-component > .header > .escape {
  color: var(--escape-color);
  font-weight: bolder;
  //font-family: "GoodDog Plain";
}
</style>
