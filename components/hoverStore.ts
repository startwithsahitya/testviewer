// Structure: components/hoverStore.ts
// Type: Component Store
import * as THREE from "three";

export type Hoverable = {
  id: string;
  mesh: THREE.Mesh;
  setHovered: (v: boolean) => void;
};

export const hoverables: Hoverable[] = [];
export const hoverState = { activeId: null as string | null };
