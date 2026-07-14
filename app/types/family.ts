export interface FamilyMember {
  id: number;
  parentIds: number[];
  spouseIds: number[];
  firstName: string;
  lastName: string;
  birthDate: string;
  deathDate: string | null;
  photo: string | null;
}

export type LinkType = 'parent-child' | 'spouse';

export interface LayoutNode extends FamilyMember {
  generation: number;
  x: number;
  y: number;
  angle: number;
  radius: number;
  isAlive: boolean;
  age: number;
  displayName: string;
}

export interface LayoutLink {
  id: string;
  type: LinkType;
  sourceId: number;
  targetId: number;
  source: LayoutNode;
  target: LayoutNode;
}

export interface TreeBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export interface TreeLayout {
  nodes: LayoutNode[];
  links: LayoutLink[];
  generations: number;
  maxRadius: number;
  bounds?: TreeBounds;
  layerHeight?: number;
  unitWidth?: number;
}