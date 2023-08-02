import { toast } from "vue-sonner";
import type {
  ScaffoldBordersBP,
  ScaffoldDescriptor,
} from "../domain/ScaffoldDescriptor";
import type ContigDimensionHolder from "./ContigDimensionHolder";

type ScaffoldId = number;
type SortedScaffoldSegment = [
  borders: ScaffoldBordersBP,
  scaffoldId: ScaffoldId
];

class ScaffoldHolder {
  public readonly scaffoldTable: Map<ScaffoldId, ScaffoldDescriptor> =
    new Map();

  public readonly scaffoldBordersBp: Map<ScaffoldId, ScaffoldBordersBP> =
    new Map();

  public readonly scaffoldBordersSorted: SortedScaffoldSegment[] = [];

  constructor(
    public readonly contigDimensionHolder: ContigDimensionHolder,
    scaffoldDescriptors?: ScaffoldDescriptor[] | undefined
  ) {
    if (scaffoldDescriptors) {
      this.updateScaffoldData(scaffoldDescriptors);
    }
  }

  public updateScaffoldData(scaffoldDescriptors: ScaffoldDescriptor[]): void {
    this.scaffoldTable.clear();
    this.scaffoldBordersBp.clear();
    this.scaffoldBordersSorted.length = 0;
    for (const sd of scaffoldDescriptors) {
      this.scaffoldTable.set(sd.scaffoldId, sd);
      if (sd.scaffoldBordersBP) {
        this.scaffoldBordersBp.set(sd.scaffoldId, sd.scaffoldBordersBP);
        this.scaffoldBordersSorted.push([sd.scaffoldBordersBP, sd.scaffoldId]);
      }
    }
    this.scaffoldBordersSorted.sort(([bp1, id1], [bp2, id2]) => {
      const leftBorders = bp1.startBP - bp2.startBP;
      const rightBordes = bp1.endBP - bp2.endBP;
      return leftBorders !== 0 ? leftBorders : rightBordes;
    });
  }

  public getScaffoldById(scaffoldId: ScaffoldId): ScaffoldDescriptor {
    const descriptor = this.scaffoldTable.get(scaffoldId);
    if (descriptor) {
      return descriptor;
    } else {
      toast.error(`Unknown scaffold with id=${scaffoldId}`);
      throw new Error(`Unknown scaffold with id=${scaffoldId}`);
    }
  }
}

export { type ScaffoldId, ScaffoldHolder };
