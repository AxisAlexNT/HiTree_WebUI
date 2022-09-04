import type { ContigDirection, ContigHideType } from "./common";

interface ContigDescriptor {
  contigId: number;
  contigName: string;
  contigLengthBp: number;
  contigLengthBins: Map<number, number>;
  direction: ContigDirection;
  presenceAtResolution: Map<number, ContigHideType>;
  scaffoldId?: number | undefined;
}

export { type ContigDescriptor };
