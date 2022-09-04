import type { ScaffoldDescriptor } from "../domain/ScaffoldDescriptor";
import type ContigDimensionHolder from "./ContigDimensionHolder";

type ScaffoldId = number;
type ScaffoldBordersBp = [leftBp: number, rightBp: number];
type SortedScaffoldSegment = [
  borders: ScaffoldBordersBp,
  scaffoldId: ScaffoldId
];

class ScaffoldHolder {
  public readonly scaffoldTable: Map<ScaffoldId, ScaffoldDescriptor> =
    new Map();

  public readonly scaffoldBordersBp: Map<ScaffoldId, ScaffoldBordersBp> =
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
      if (sd.scaffoldBorders) {
        const startContigDescriptor =
          this.contigDimensionHolder.contigDescriptors[
            sd.scaffoldBorders.startContigId
          ];
        const endContigDescriptor =
          this.contigDimensionHolder.contigDescriptors[
            sd.scaffoldBorders.endContigId
          ];
        const bordersBp: ScaffoldBordersBp = [
          this.contigDimensionHolder.prefix_sum_bp[
            startContigDescriptor.contigId
          ],
          this.contigDimensionHolder.prefix_sum_bp[
            endContigDescriptor.contigId
          ] + endContigDescriptor.contigLengthBp,
        ];
        this.scaffoldBordersBp.set(sd.scaffoldId, bordersBp);
        this.scaffoldBordersSorted.push([bordersBp, sd.scaffoldId]);
      }
    }
    this.scaffoldBordersSorted.sort(([[l1, r1], id1], [[l2, r2], id2]) => {
      const leftBorders = l1 - l2;
      const rightBordes = r1 - r2;
      return leftBorders !== 0 ? leftBorders : rightBordes;
    });
  }

  public getScaffoldById(scaffoldId: ScaffoldId): ScaffoldDescriptor {
    const descriptor = this.scaffoldTable.get(scaffoldId);
    if (descriptor) {
      return descriptor;
    } else {
      throw new Error(`Unknown scaffold with id=${scaffoldId}`);
    }
  }
}

export { type ScaffoldId, ScaffoldHolder };
