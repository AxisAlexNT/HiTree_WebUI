<template>
  <div class="roulette-component" :id="props.name">
    <div class="header">
      <div style="margin-left: 1rem">
        <div v-if="!visible">{{ props.name }}</div>
        <ul v-if="visible" class="nav">
          <li v-for="[name, enabled] of layerNames()" :key="name">
            <a v-if="enabled" class="layer-enabled" @click="enable(name)">
              {{ name }}
            </a>
            <a v-if="!enabled" class="layer-disabled" @click="enable(name)">
              {{ name }}
            </a>
          </li>
        </ul>
      </div>

      <div style="margin-right: 1rem">
        <button
          v-if="visible"
          class="btn btn-outline-primary bi bi-chevron-down symbol-stroke"
          @click="hide()"
        ></button>
        <button
          v-if="!visible"
          class="btn btn-outline-primary bi bi-chevron-right symbol-stroke"
          @click="show()"
        ></button>
        <i style="padding: 0 0.2rem"></i>
        <button
          class="btn btn-outline-primary bi bi-x escape symbol-stroke"
          @click="deleteSelf()"
        ></button>
        <i style="width: 1rem"></i>
      </div>
    </div>
    <div v-if="visible">
      <RouletteLayer
        v-for="layer of layers()"
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
import { ref, watch } from "vue";

const emit = defineEmits<{
  (e: "delete-component", componentName: string): void;
}>();

const props = defineProps<{
  roulette: Roulette;
  component: RouletteComponent;
  name: string;
}>();

// FIXME same name import: any -> roulette/RouletteLayer<never>
// eslint-disable-next-line
// const showing: Map<any, boolean> = [...props.component?.layers.values() ?? []].map((l) => [true, l]) ?? new Map();

const showing = ref(new Set<string>());
const visible = ref(true);

watch(
  () => props.component.layers.size,
  () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Array.from(props.component.layers).forEach(([name, _]) => showing.value.add(name));
  }
);

// fail warning
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function enable(layerName: string) {
  const set = showing.value;

  if (set.has(layerName)) {
    set.delete(layerName);
  } else {
    set.add(layerName);
  }
}

const deleteSelf = () => emit("delete-component", props.name);

const show = () => (visible.value = true);

const hide = () => (visible.value = false);

// eslint-disable-next-line
function layers() {
  return Array.from(props.component.layers ?? new Map())
    .filter(([name, _]) => showing.value.has(name))
    .map(([_, layer]) => layer);
}

function layerNames(): Map<string, boolean> {
  return new Map(Array.from(props.component.layers)
      .map(([name, _]) => [name, showing.value.has(name)]));
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
  height: auto;
  border: 0 solid var(--border-color);
  border-top-width: 2px;
  border-radius: 1rem;
  background-color: var(--bg-color);
  margin: 0.05rem 0;
  padding: 0.5rem 0 0 0;
}

.roulette-component > .header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.roulette-component > .header > .nav {
  display: flex;
  flex-direction: row;
  justify-content: left;
}

.roulette-component > .header > .nav .layer-enabled {
  color: var(--enabled-color);
  text-decoration: underline;
}

.roulette-component > .header > .nav .layer-disabled {
  color: var(--disabled-color);
  text-decoration: none;
}

.roulette-component > .header .escape {
  color: var(--escape-color);
}

.roulette-component > .header .symbol-stroke {
  font-size: 1rem;
  -webkit-text-stroke-width: 0.2rem;
  padding: 0.2rem 0.2rem 0;
}
</style>
