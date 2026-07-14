<template>
  <g
    class="family-node"
    :class="{ 'family-node--alive': node.isAlive }"
    :transform="`translate(${node.x}, ${node.y})`"
    @mouseenter="$emit('hover', node.id, true)"
    @mouseleave="$emit('hover', node.id, false)"
  >
    <circle class="family-node__ring" :r="44" :fill="generationColor" />

    <clipPath :id="clipId">
      <circle r="34" />
    </clipPath>

    <g clip-path="url(#{{ clipId }})">
      <image
        v-if="node.photo"
        :href="node.photo"
        x="-34"
        y="-34"
        width="68"
        height="68"
        preserveAspectRatio="xMidYMid slice"
      />
      <image
        v-else
        href="/avatar-placeholder.webp"
        x="-34"
        y="-34"
        width="68"
        height="68"
        preserveAspectRatio="xMidYMid slice"
      />
    </g>

    <circle class="family-node__border" r="34" :stroke="generationStroke" />

    <text class="family-node__name" y="56" text-anchor="middle">
      {{ node.firstName }}
    </text>
    <text class="family-node__surname" y="72" text-anchor="middle">
      {{ node.lastName }}
    </text>
    <text class="family-node__dates" y="90" text-anchor="middle">
      {{ dates }}
    </text>
    <text class="family-node__age" y="106" text-anchor="middle">
      {{ node.age }} {{ pluralYears(node.age) }}
    </text>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LayoutNode } from '~/types/family';
import { useFamilyTree } from '~/composables/useFamilyTree';

const props = defineProps<{
  node: LayoutNode;
}>();

defineEmits<{
  (e: 'hover', id: number, state: boolean): void;
}>();

const { formatDates } = useFamilyTree();

const clipId = computed(() => `clip-${props.node.id}`);
const dates = computed(() => formatDates(props.node.birthDate, props.node.deathDate));

const PALETTE_FILL = [
  'rgba(184, 134, 11, 0.22)',
  'rgba(85, 107, 47, 0.22)',
  'rgba(107, 142, 35, 0.22)',
  'rgba(60, 120, 90, 0.22)',
  'rgba(70, 130, 140, 0.22)',
  'rgba(130, 100, 140, 0.22)',
];

const PALETTE_STROKE = [
  'rgba(184, 134, 11, 0.85)',
  'rgba(85, 107, 47, 0.85)',
  'rgba(107, 142, 35, 0.85)',
  'rgba(60, 120, 90, 0.85)',
  'rgba(70, 130, 140, 0.85)',
  'rgba(130, 100, 140, 0.85)',
];

const generationColor = computed(() => PALETTE_FILL[props.node.generation % PALETTE_FILL.length]);
const generationStroke = computed(
  () => PALETTE_STROKE[props.node.generation % PALETTE_STROKE.length],
);

const pluralYears = (n: number): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return 'лет';
  if (mod10 === 1) return 'год';
  if (mod10 >= 2 && mod10 <= 4) return 'года';
  return 'лет';
};
</script>

<style lang="scss" scoped>
.family-node {
  cursor: pointer;
  transition: filter 0.25s ease;

  &:hover {
    filter: drop-shadow(0 6px 14px rgba(62, 45, 30, 0.4));
  }

  &__ring {
    transition: fill 0.25s ease;
  }

  &__border {
    fill: none;
    stroke-width: 1.8;
    transition: stroke-width 0.25s ease;
  }

  &__name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 14px;
    font-weight: 600;
    fill: #3e2d1e;
  }

  &__surname {
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px;
    font-weight: 500;
    fill: #5a4632;
  }

  &__dates {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    fill: #6b5440;
    letter-spacing: 0.5px;
  }

  &__age {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 500;
    fill: #b8860b;
  }

  &:hover &__ring {
    fill: rgba(184, 134, 11, 0.35);
  }

  &:hover &__border {
    stroke-width: 2.8;
  }
}
</style>