<template>
  <div class="family-legend">
    <div class="family-legend__title">Поколения</div>
    <div class="family-legend__list">
      <div
        v-for="gen in generations"
        :key="gen.index"
        class="family-legend__item"
      >
        <span
          class="family-legend__dot"
          :style="{ background: gen.color }"
        />
        <span class="family-legend__label">{{ gen.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  total: number;
}>();

const PALETTE = [
  'rgba(184, 134, 11, 0.7)',
  'rgba(85, 107, 47, 0.7)',
  'rgba(107, 142, 35, 0.7)',
  'rgba(128, 128, 0, 0.7)',
  'rgba(160, 120, 60, 0.7)',
];

const LABELS = ['Основатели', 'Дети', 'Внуки', 'Правнуки', 'Праправнуки'];

const generations = computed(() => {
  return Array.from({ length: props.total }, (_, i) => ({
    index: i,
    color: PALETTE[i % PALETTE.length],
    label: LABELS[i] ?? `Поколение ${i + 1}`,
  }));
});
</script>

<style lang="scss" scoped>
.family-legend {
  position: absolute;
  bottom: 24px;
  left: 24px;
  padding: 16px 20px;
  background: rgba(245, 235, 215, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(184, 134, 11, 0.3);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(62, 45, 30, 0.15);
  font-family: 'Inter', sans-serif;
  z-index: 10;

  &__title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 600;
    color: #3e2d1e;
    margin-bottom: 10px;
    letter-spacing: 0.5px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: #5a4632;
  }

  &__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid rgba(62, 45, 30, 0.2);
  }
}
</style>