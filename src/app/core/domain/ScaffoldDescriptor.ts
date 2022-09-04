import type { ScaffoldDirection } from "./common";

interface ScaffoldDescriptor {
  scaffoldId: number;
  scaffoldName: string;
  scaffoldBorders: ScaffoldBorders | null;
  direction: ScaffoldDirection;
  spacerLength: number;
}

interface ScaffoldBorders {
  startContigId: number;
  endContigId: number;
}

export { type ScaffoldDescriptor, type ScaffoldBorders };
