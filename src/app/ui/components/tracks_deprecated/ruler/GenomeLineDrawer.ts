import { GenomeLine, point } from "./genome-line";

export class GenomeLineDrawer {
  private readonly genomeLine: GenomeLine;
  private static readonly hr = new point(0, 10);
  private static readonly vr = new point(10, 0);

  public constructor(
    private readonly start: point,
    private readonly length: number,
    private readonly horizontal: boolean,
    private readonly skip: number,
    private readonly skipConversion: (shift: number) => number
  ) {
    this.genomeLine = new GenomeLine(
      start,
      length,
      horizontal,
      skip,
      skipConversion
    );

    this.genomeLine.reload();
  }

  public shift(xShift: number, yShift: number): void {
    this.move(new point(xShift, yShift));
  }

  public move(shift: point): void {
    if (
      (this.horizontal && shift.x != 0) ||
      (!this.horizontal && shift.y != 0)
    ) {
      this.genomeLine.reload();
    }
  }

  public draw(): void {
    this.drawLine(
      this.genomeLine.start,
      this.genomeLine.streaks[this.genomeLine.streaks.length - 1].position,
      1
    );

    for (const streak of this.genomeLine.streaks) {
      this.drawLine(
        streak.position.sub(
          this.genomeLine.horizontal ? GenomeLineDrawer.hr : GenomeLineDrawer.vr
        ),
        streak.position.add(
          this.genomeLine.horizontal ? GenomeLineDrawer.hr : GenomeLineDrawer.vr
        ),
        streak.weight
      );
    }
  }

  private drawLine(start: point, end: point, weight: number): void {
    console.log(`${start}-${end}#${weight}`);
    // three.js interaction
  }
}
