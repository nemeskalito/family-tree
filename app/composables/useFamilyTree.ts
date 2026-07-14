import type { FamilyMember, LayoutNode, LayoutLink, TreeLayout } from '~/types/family';

/**
 * "Семейная ячейка" — пара супругов (или один человек) + их дети-ячейки.
 * Это основа алгоритма Reingold-Tilford для генеалогических деревьев.
 */
interface Couple {
  id: string;
  partners: FamilyMember[]; // 1 или 2 человека
  children: Couple[];
  width: number; // ширина поддерева в "единицах"
  centerX: number;
  y: number;
}

export const useFamilyTree = () => {
  const computeAge = (birth: string, death: string | null) => {
    const b = new Date(birth);
    const end = death ? new Date(death) : new Date();
    let age = end.getFullYear() - b.getFullYear();
    const m = end.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < b.getDate())) age--;
    return { age: Math.max(age, 0), isAlive: death === null };
  };

  const formatDates = (birth: string, death: string | null): string => {
    const b = birth.slice(0, 4);
    const d = death ? death.slice(0, 4) : '';
    return d ? `${b}–${d}` : `${b} —`;
  };

  /**
   * Определяет поколение через BFS по связям parent/spouse.
   */
  const computeGenerations = (members: FamilyMember[]): Map<number, number> => {
    const map = new Map<number, number>();
    for (let iter = 0; iter < 30; iter++) {
      let changed = false;
      members.forEach((m) => {
        const candidates: number[] = [];
        m.parentIds.forEach((pid) => {
          const pg = map.get(pid);
          if (pg !== undefined) candidates.push(pg + 1);
        });
        m.spouseIds.forEach((sid) => {
          const sg = map.get(sid);
          if (sg !== undefined) candidates.push(sg);
        });
        const current = map.get(m.id);
        const next = candidates.length ? Math.max(...candidates) : 0;
        if (current === undefined || current !== next) {
          map.set(m.id, next);
          changed = true;
        }
      });
      if (!changed) break;
    }
    return map;
  };

  /**
   * Строит пары супругов. Каждый человек — максимум в одной паре.
   */
  const buildCouples = (members: FamilyMember[]): Couple[] => {
    const byId = new Map(members.map((m) => [m.id, m]));
    const placed = new Set<number>();
    const couples: Couple[] = [];
    const coupleByPerson = new Map<number, Couple>();

    // Сначала создаём пары для супругов
    members.forEach((m) => {
      if (placed.has(m.id)) return;
      const spouseId = m.spouseIds.find((sid) => byId.has(sid) && !placed.has(sid));
      const partners: FamilyMember[] = [m];
      placed.add(m.id);
      if (spouseId !== undefined) {
        const spouse = byId.get(spouseId)!;
        partners.push(spouse);
        placed.add(spouseId);
      }
      const couple: Couple = {
        id: partners.map((p) => p.id).sort().join('-'),
        partners,
        children: [],
        width: 1,
        centerX: 0,
        y: 0,
      };
      couples.push(couple);
      partners.forEach((p) => coupleByPerson.set(p.id, couple));
    });

    // Привязываем детей к парам
    members.forEach((child) => {
      if (!child.parentIds.length) return;

      // Ищем пару, где оба родителя (идеально)
      let targetCouple: Couple | undefined;
      for (const c of couples) {
        const pids = new Set(c.partners.map((p) => p.id));
        if (child.parentIds.every((pid) => pids.has(pid))) {
          targetCouple = c;
          break;
        }
      }

      // Если нет — ищем пару, где хотя бы один родитель
      if (!targetCouple) {
        for (const pid of child.parentIds) {
          const c = coupleByPerson.get(pid);
          if (c) {
            targetCouple = c;
            break;
          }
        }
      }

      if (targetCouple) {
        const childCouple = coupleByPerson.get(child.id);
        if (childCouple && !targetCouple.children.includes(childCouple)) {
          targetCouple.children.push(childCouple);
        }
      }
    });

    return couples;
  };

  /**
   * Находит корневые пары (у партнёров нет родителей в дереве).
   */
  const findRoots = (couples: Couple[], byId: Map<number, FamilyMember>): Couple[] => {
    const isChild = new Set<Couple>();
    couples.forEach((c) => c.children.forEach((ch) => isChild.add(ch)));
    const roots = couples.filter((c) => !isChild.has(c));

    // Если все в цикле — берём первую пару
    if (roots.length === 0 && couples.length > 0) {
      return [couples[0]!];
    }
    return roots;
  };

  /**
   * Рекурсивно вычисляет ширину поддерева (в единицах).
   * Лист = 1, иначе = сумма ширин детей (но минимум 1).
   */
  const computeWidth = (couple: Couple): number => {
    if (couple.children.length === 0) {
      couple.width = 1;
      return 1;
    }
    const sum = couple.children.reduce((s, ch) => s + computeWidth(ch), 0);
    couple.width = Math.max(1, sum);
    return couple.width;
  };

  /**
   * Рекурсивно размещает пары.
   * @param couple текущая пара
   * @param leftX левая граница выделенного пространства
   * @param unitWidth ширина одной "единицы" в пикселях
   * @param layerHeight высота слоя
   * @param depth глубина (поколение)
   */
  const placeCouple = (
    couple: Couple,
    leftX: number,
    unitWidth: number,
    layerHeight: number,
    depth: number,
  ) => {
    const totalWidth = couple.width * unitWidth;
    couple.centerX = leftX + totalWidth / 2;
    couple.y = depth * layerHeight;

    // Размещаем детей слева направо, пропорционально их ширине
    let cursor = leftX;
    couple.children.forEach((child) => {
      const childWidth = child.width * unitWidth;
      placeCouple(child, cursor, unitWidth, layerHeight, depth + 1);
      cursor += childWidth;
    });
  };

  const buildLayout = (members: FamilyMember[]): TreeLayout => {
    const normalized = members.map((m) => ({
      ...m,
      spouseIds: m.spouseIds ?? [],
    }));

    const generations = computeGenerations(normalized);
    const byId = new Map(normalized.map((m) => [m.id, m]));

    const UNIT_WIDTH = 200; // ширина, занимаемая одним "листом"
    const LAYER_HEIGHT = 280; // высота между слоями
    const SPOUSE_GAP = 120; // расстояние между супругами в паре

    const couples = buildCouples(normalized);
    const roots = findRoots(couples, byId);

    // Вычисляем ширины
    roots.forEach(computeWidth);

    // Размещаем корни рядом (если их несколько)
    const totalRootWidth = roots.reduce((s, r) => s + r.width, 0) * UNIT_WIDTH;
    let cursor = -totalRootWidth / 2;
    roots.forEach((root) => {
      const w = root.width * UNIT_WIDTH;
      placeCouple(root, cursor, UNIT_WIDTH, LAYER_HEIGHT, 0);
      cursor += w;
    });

    // Преобразуем пары в позиции людей
    const posById = new Map<number, { x: number; y: number; generation: number }>();

    const placePartners = (couple: Couple) => {
      const partners = couple.partners;
      const gen = generations.get(partners[0]!.id) ?? 0;

      if (partners.length === 1) {
        posById.set(partners[0]!.id, { x: couple.centerX, y: couple.y, generation: gen });
      } else {
        // Два партнёра — симметрично вокруг centerX
        const p1 = partners[0]!;
        const p2 = partners[1]!;
        posById.set(p1.id, {
          x: couple.centerX - SPOUSE_GAP / 2,
          y: couple.y,
          generation: gen,
        });
        posById.set(p2.id, {
          x: couple.centerX + SPOUSE_GAP / 2,
          y: couple.y,
          generation: gen,
        });
      }

      couple.children.forEach(placePartners);
    };
    roots.forEach(placePartners);

    // Формируем LayoutNode
    const nodes: LayoutNode[] = normalized.map((m) => {
      const pos = posById.get(m.id) ?? { x: 0, y: 0, generation: 0 };
      const { age, isAlive } = computeAge(m.birthDate, m.deathDate);
      return {
        ...m,
        generation: pos.generation,
        radius: 0,
        angle: 0,
        x: pos.x,
        y: pos.y,
        isAlive,
        age,
        displayName: `${m.firstName} ${m.lastName}`,
      };
    });

    const nodeById = new Map(nodes.map((n) => [n.id, n]));

    // Формируем связи
    const links: LayoutLink[] = [];
    const spousePairs = new Set<string>();

    // Связи супруг↔супруг
    couples.forEach((c) => {
      if (c.partners.length < 2) return;
      const p1 = c.partners[0]!;
      const p2 = c.partners[1]!;
      const n1 = nodeById.get(p1.id);
      const n2 = nodeById.get(p2.id);
      if (n1 && n2) {
        const pairKey = [p1.id, p2.id].sort().join('-');
        if (!spousePairs.has(pairKey)) {
          spousePairs.add(pairKey);
          links.push({
            id: `sp-${pairKey}`,
            type: 'spouse',
            sourceId: p1.id,
            targetId: p2.id,
            source: n1,
            target: n2,
          });
        }
      }
    });

    // Связи parent→child
    nodes.forEach((child) => {
      child.parentIds.forEach((pid) => {
        const parent = nodeById.get(pid);
        if (parent) {
          links.push({
            id: `pc-${pid}-${child.id}`,
            type: 'parent-child',
            sourceId: pid,
            targetId: child.id,
            source: parent,
            target: child,
          });
        }
      });
    });

    // Границы
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    nodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    const padX = 250;
    const padY = 200;
    const width = Math.max(800, maxX - minX + padX * 2);
    const height = Math.max(600, maxY - minY + padY * 2);

    // Максимальная глубина
    const maxGen = Math.max(0, ...nodes.map((n) => n.generation));

    return {
      nodes,
      links,
      generations: maxGen + 1,
      maxRadius: Math.max(width, height) / 2,
      bounds: {
        minX: minX - padX,
        maxX: maxX + padX,
        minY: minY - padY,
        maxY: maxY + padY,
        width,
        height,
      },
      layerHeight: LAYER_HEIGHT,
      unitWidth: UNIT_WIDTH,
      couples,
    } as TreeLayout & { bounds: any; layerHeight: number; unitWidth: number; couples: Couple[] };
  };

  return {
    buildLayout,
    formatDates,
  };
};