<template>
  <div class="family-tree">
    <svg
      ref="svgRef"
      class="family-tree__svg"
      :viewBox="viewBox"
      preserveAspectRatio="xMidYMid meet"
    >
      <g ref="contentRef" class="family-tree__content">
        <!-- Вертикальные полосы слоёв -->
        <g class="family-tree__layers">
          <rect
            v-for="layer in layers"
            :key="layer.gen"
            :x="layer.x"
            :y="layer.y"
            :width="layer.width"
            :height="layer.height"
            :fill="layer.fill"
            rx="8"
          />
          <text
            v-for="layer in layers"
            :key="'label-' + layer.gen"
            :x="layer.x + 20"
            :y="layer.y + 30"
            class="family-tree__layer-label"
          >
            {{ layer.label }}
          </text>
        </g>

        <FamilyConnections :links="layout.links" :highlighted-ids="highlightedIds" />

        <FamilyNode
          v-for="node in layout.nodes"
          :key="node.id"
          :node="node"
          @hover="onHover"
        />
      </g>
    </svg>

    <FamilyLegend :total="layout.generations" />

    <div class="family-tree__controls">
      <button class="family-tree__btn" @click="zoomIn" title="Приблизить">+</button>
      <button class="family-tree__btn" @click="zoomOut" title="Отдалить">−</button>
      <button class="family-tree__btn" @click="resetView" title="Сбросить">⟲</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import * as d3 from 'd3';
import type { FamilyMember, TreeLayout } from '~/types/family';
import { useFamilyTree } from '~/composables/useFamilyTree';
import { useZoom } from '~/composables/useZoom';
import FamilyNode from './FamilyNode.vue';
import FamilyConnections from './FamilyConnections.vue';
import FamilyLegend from './FamilyLegend.vue';

const props = defineProps<{
  members: FamilyMember[];
}>();

const { buildLayout } = useFamilyTree();

const svgRef = ref<SVGSVGElement | null>(null);
const contentRef = ref<SVGGElement | null>(null);

const layout = computed<TreeLayout>(() => buildLayout(props.members));

const highlightedIds = reactive(new Set<number>());

const LAYER_COLORS = [
  'rgba(184, 134, 11, 0.06)',
  'rgba(85, 107, 47, 0.06)',
  'rgba(107, 142, 35, 0.06)',
  'rgba(60, 120, 90, 0.06)',
  'rgba(70, 130, 140, 0.06)',
  'rgba(130, 100, 140, 0.06)',
];

const LAYER_LABELS = ['Основатели', 'Дети', 'Внуки', 'Правнуки', 'Праправнуки'];

const viewBox = computed(() => {
  const b = (layout.value as any).bounds;
  if (!b) return '-500 -300 2000 1500';
  const pad = 80;
  return `${b.minX - pad} ${b.minY - pad} ${b.width + pad * 2} ${b.height + pad * 2}`;
});

const layers = computed(() => {
  const b = (layout.value as any).bounds;
  const layerHeight = (layout.value as any).layerHeight ?? 280;
  if (!b) return [];

  const result = [];
  for (let g = 0; g < layout.value.generations; g++) {
    result.push({
      gen: g,
      x: b.minX,
      y: g * layerHeight - 60,
      width: b.width,
      height: layerHeight - 20,
      fill: LAYER_COLORS[g % LAYER_COLORS.length],
      label: LAYER_LABELS[g] ?? `Поколение ${g + 1}`,
    });
  }
  return result;
});

const onHover = (id: number, state: boolean) => {
  const node = layout.value.nodes.find((n) => n.id === id);
  if (!node) return;

  if (state) {
    highlightedIds.clear();
    highlightedIds.add(id);
    node.parentIds.forEach((pid) => highlightedIds.add(pid));
    layout.value.nodes.forEach((n) => {
      if (n.parentIds.includes(id)) highlightedIds.add(n.id);
    });
    node.spouseIds.forEach((sid) => highlightedIds.add(sid));
  } else {
    highlightedIds.clear();
  }
};

const { init, reset, zoomBehavior } = useZoom(svgRef, contentRef);

onMounted(() => {
  init();
});

const zoomIn = () => {
  if (!svgRef.value || !zoomBehavior.value) return;
  const svg = d3.select(svgRef.value);
  svg.transition().duration(300).call(zoomBehavior.value.scaleBy, 1.3);
};

const zoomOut = () => {
  if (!svgRef.value || !zoomBehavior.value) return;
  const svg = d3.select(svgRef.value);
  svg.transition().duration(300).call(zoomBehavior.value.scaleBy, 0.75);
};

const resetView = () => reset();
</script>

<style lang="scss" scoped>
.family-tree {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  &__svg {
    width: 100%;
    height: 100%;
    display: block;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }

  &__layer-label {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 600;
    font-style: italic;
    fill: rgba(62, 45, 30, 0.4);
    letter-spacing: 1.5px;
    pointer-events: none;
  }

  &__controls {
    position: absolute;
    top: 24px;
    right: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 10;
  }

  &__btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid rgba(184, 134, 11, 0.4);
    background: rgba(245, 235, 215, 0.9);
    backdrop-filter: blur(8px);
    color: #3e2d1e;
    font-family: 'Inter', sans-serif;
    font-size: 20px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(62, 45, 30, 0.15);

    &:hover {
      background: rgba(245, 235, 215, 1);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(62, 45, 30, 0.25);
    }

    &:active {
      transform: translateY(0);
    }
  }
}
</style>