<template>
  <g class="family-connections">
    <!-- Связи супруг↔супруг -->
    <line
      v-for="link in spouseLinks"
      :key="link.id"
      :x1="link.source.x"
      :y1="link.source.y"
      :x2="link.target.x"
      :y2="link.target.y"
      class="family-connections__spouse"
      :class="{ 'family-connections__spouse--highlighted': isHighlighted(link) }"
    />

    <!-- Связи parent→child в виде "полок" -->
    <path
      v-for="shelf in shelves"
      :key="shelf.id"
      :d="shelf.d"
      class="family-connections__line"
      :class="{ 'family-connections__line--highlighted': shelf.highlighted }"
      fill="none"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LayoutLink, LayoutNode } from '~/types/family';

const props = defineProps<{
  links: LayoutLink[];
  highlightedIds: Set<number>;
}>();

const CARD_RADIUS = 34;
const SHELF_OFFSET = 60; // насколько "полка" ниже родителя

const spouseLinks = computed(() => props.links.filter((l) => l.type === 'spouse'));
const parentLinks = computed(() => props.links.filter((l) => l.type === 'parent-child'));

const isHighlighted = (link: LayoutLink): boolean =>
  props.highlightedIds.has(link.sourceId) || props.highlightedIds.has(link.targetId);

/**
 * Группируем детей по "родительской паре".
 * Родительская пара определяется как общие родители ребёнка.
 * Для каждого ребёнка находим его "семейную точку" — центр между родителями.
 */
const shelves = computed(() => {
  // Группируем: ключ = отсортированный список parentIds, значение = дети
  const groups = new Map<string, { parents: LayoutNode[]; children: LayoutNode[] }>();

  parentLinks.value.forEach((link) => {
    const child = link.target;
    const parentIds = [...child.parentIds].sort((a, b) => a - b);
    const key = parentIds.join(',');

    if (!groups.has(key)) {
      const parents = parentIds
        .map((pid) => props.links.find((l) => l.sourceId === pid)?.source)
        .filter((p): p is LayoutNode => !!p);
      // Убираем дубликаты
      const uniqueParents = Array.from(new Map(parents.map((p) => [p.id, p])).values());
      groups.set(key, { parents: uniqueParents, children: [] });
    }
    const group = groups.get(key)!;
    if (!group.children.find((c) => c.id === child.id)) {
      group.children.push(child);
    }
  });

  const result: { id: string; d: string; highlighted: boolean }[] = [];

  groups.forEach((group, key) => {
    if (group.parents.length === 0 || group.children.length === 0) return;

    // Центр родителей
    const parentCenterX =
      group.parents.reduce((s, p) => s + p.x, 0) / group.parents.length;
    const parentY = group.parents[0]!.y;

    // Y "полки" — чуть ниже родителей
    const shelfY = parentY + SHELF_OFFSET;

    // Дети отсортированы по X
    const sortedChildren = [...group.children].sort((a, b) => a.x - b.x);

    const highlighted =
      group.parents.some((p) => props.highlightedIds.has(p.id)) ||
      sortedChildren.some((c) => props.highlightedIds.has(c.id));

    // Вертикальная линия от центра родителей вниз к полке
    result.push({
      id: `${key}-trunk`,
      d: `M ${parentCenterX} ${parentY + CARD_RADIUS} L ${parentCenterX} ${shelfY}`,
      highlighted,
    });

    if (sortedChildren.length === 1) {
      // Один ребёнок — прямая линия от полки к ребёнку
      const child = sortedChildren[0]!;
      result.push({
        id: `${key}-branch-${child.id}`,
        d: `M ${parentCenterX} ${shelfY} L ${child.x} ${shelfY} L ${child.x} ${child.y - CARD_RADIUS}`,
        highlighted,
      });
    } else {
      // Несколько детей — горизонтальная полка + вертикальные отводы
      const leftX = sortedChildren[0]!.x;
      const rightX = sortedChildren[sortedChildren.length - 1]!.x;

      // Горизонтальная полка
      result.push({
        id: `${key}-shelf`,
        d: `M ${leftX} ${shelfY} L ${rightX} ${shelfY}`,
        highlighted,
      });

      // Соединяем полку с центром родителей (если центр не между крайними детьми)
      if (parentCenterX < leftX || parentCenterX > rightX) {
        const connectX = parentCenterX < leftX ? leftX : rightX;
        result.push({
          id: `${key}-connect`,
          d: `M ${parentCenterX} ${shelfY} L ${connectX} ${shelfY}`,
          highlighted,
        });
      }

      // Вертикальные отводы к каждому ребёнку
      sortedChildren.forEach((child) => {
        result.push({
          id: `${key}-drop-${child.id}`,
          d: `M ${child.x} ${shelfY} L ${child.x} ${child.y - CARD_RADIUS}`,
          highlighted,
        });
      });
    }
  });

  return result;
});
</script>

<style lang="scss" scoped>
.family-connections {
  pointer-events: none;

  &__spouse {
    stroke: rgba(184, 134, 11, 0.7);
    stroke-width: 2;
    stroke-dasharray: 5 3;
    transition:
      stroke 0.25s ease,
      stroke-width 0.25s ease;

    &--highlighted {
      stroke: #d4a017;
      stroke-width: 2.8;
      stroke-dasharray: none;
    }
  }

  &__line {
    stroke: rgba(101, 67, 33, 0.45);
    stroke-width: 1.5;
    transition:
      stroke 0.25s ease,
      stroke-width 0.25s ease;

    &--highlighted {
      stroke: #b8860b;
      stroke-width: 2.4;
    }
  }
}
</style>