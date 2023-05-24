import { Track, TracksHolder } from "@/app/ui/components/tracks/ruler/bed-format-parser";

class Pair {
  public readonly x: number;
  public readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public size(): number {
    return this.y - this.x;
  }

  public toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}

export class Vector extends Pair {
  public add(other: Vector): Vector {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  public swap(): Vector {
    return new Vector(this.y, this.x);
  }

  public opposite(): Vector {
    return new Vector(-this.x, -this.y);
  }
}

export class Interval extends Pair {
  public shift(d: number): Interval {
    return new Interval(this.x + d, this.y + d);
  }

  public scale(d: number, p: number): Interval {
    const center = this.x + this.size() * p;
    const leftSize = center - this.x;
    const rightSize = this.y - center;
    return new Interval(center - leftSize * d, center + rightSize * d);
  }

  public zoom(d: number, p: number, bounds: Interval): Interval {
    const center = this.x + this.size() * p;

    const leftSize = center - Math.max(bounds.x, this.x);
    const rightSize = Math.min(bounds.y, this.y) - center;

    return new Interval(
      this.x - leftSize * (d - 1),
      this.y + rightSize * (d - 1)
    );
  }

  public intersect(other: Interval): Interval {
    const start = Math.max(this.x, other.x);
    const end = Math.min(this.y, other.y);

    if (start < end) {
      return new Interval(start, end);
    } else {
      return new Interval(end - 1, end);
    }
  }
}

export class Contig {
  public readonly interval: Interval;
  public readonly reversed: boolean;

  constructor(interval: Interval, reversed: boolean) {
    this.interval = interval;
    this.reversed = reversed;
  }

  public equals(other: Contig): boolean {
    return this.interval.x == other.interval.x && this.interval.y == other.interval.y;
  }
}

enum ROType {
  STREAK,
  DOT,
  NO_DIRECTION_BOX,
  FORWARD_BOX,
  REVERSED_BOX,
  LEFT_ARROW,
  RIGHT_ARROW,
}

export class RouletteObject {
  public readonly position: number;
  public readonly type: ROType;
  public readonly text: string | undefined;

  constructor(position: number, type: ROType, text: string | undefined) {
    this.position = position;
    this.type = type;
    this.text = text;
  }

  public in(pos: number): boolean {
    return pos > this.position - 3 && pos < this.position + 3;
  }

  isVisible(shiftFactor: number, visibleZone: Interval): boolean {
    const pos = this.position * shiftFactor;

    return visibleZone.x <= pos && pos <= visibleZone.y;
  }
}

export class RouletteLongObject extends RouletteObject {
  public readonly size: number;
  public readonly contig: Track | undefined;

  constructor(position: number, size: number, type: ROType, contig: Track | undefined) {
    super(position, type, undefined);
    this.size = size;
    this.contig = contig;
  }

  public in(pos: number): boolean {
    return pos > this.position - 3 && pos < this.position + this.size + 3;
  }

  isVisible(shiftFactor: number, visibleZone: Interval): boolean {
    const start = this.position * shiftFactor;
    const end = (this.position + this.size) * shiftFactor;

    return (visibleZone.x <= start && start <= visibleZone.y) || (visibleZone.x <= end && end <= visibleZone.y);
  }
}

export interface OnMouseObject {
  readonly position: Interval;
  readonly contig: Track;
}

export class RouletteConfig {
  public readonly visualPosition: Vector;
  public visibleLength: number;
  public readonly horizontal: boolean;
  public acceptValue: (point: number) => number;
  public acceptPixel: (value: number) => number;
  public acceptContig: (point: number) => Contig;
  public trackHolder: TracksHolder;

  constructor(
    visualPosition: Vector,
    visibleLength: number,
    horizontal: boolean,
    acceptValue: (point: number) => number,
    acceptPixel: (value: number) => number,
    acceptContig: (point: number) => Contig,
    trackHolder: TracksHolder
  ) {
    this.visualPosition = visualPosition;
    this.visibleLength = visibleLength;
    this.horizontal = horizontal;
    this.acceptValue = acceptValue;
    this.acceptPixel = acceptPixel;
    this.acceptContig = acceptContig;
    this.trackHolder = trackHolder;
  }

  public visible(): Interval {
    return new Interval(0, this.visibleLength);
  }

  public pos(c: number): Vector {
    return this.horizontal ? new Vector(c, 0) : new Vector(0, c);
  }

  public translate(c: number): Vector {
    return this.pos(c).add(this.visualPosition);
  }

  public orient(d: number): Vector {
    return this.horizontal ? new Vector(d, 0) : new Vector(0, d);
  }
}

export class Roulette {
  private readonly config: RouletteConfig;
  private interval: Interval;
  private offset: number;
  private streaks: Array<RouletteObject>;
  private readonly objects: Array<RouletteObject>;
  private factor: number;

  constructor(config: RouletteConfig, len: number) {
    this.config = config;
    this.interval = new Interval(0, len);
    this.offset = 0;
    this.streaks = [];
    this.objects = [];
    this.factor = 1;

    // this.init();

    // this.invalidate(1);
  }

  public init(): void {
    this.factor = 1;
    this.streaks = [];

    const start = this.interval.x;
    const end = this.interval.y;

    ///// BOX
    for (const track of this.config.trackHolder.tracks) {
      const trackStart = this.config.acceptPixel(track.start);
      const trackEnd = this.config.acceptPixel(track.end);

      this.objects.push(
        new RouletteLongObject(trackStart, trackEnd - trackStart,
          track.strand === undefined ? ROType.NO_DIRECTION_BOX
            : track.strand === "+" ? ROType.FORWARD_BOX
            : ROType.REVERSED_BOX,
          track
        )
      );
    }

    const genArrow = (contig: Contig): RouletteObject =>
      new RouletteLongObject(
        contig.interval.x,
        contig.interval.size(),
        contig.reversed ? ROType.LEFT_ARROW : ROType.RIGHT_ARROW,
        undefined
      );

    ///// ARROWS
    let alongContig = this.config.acceptContig(start + this.offset);

    for (let dot = start + this.offset + 1; dot < end + this.offset; dot++) {
      const currentContig = this.config.acceptContig(dot);

      if (!alongContig.equals(currentContig)) {
        this.objects.push(genArrow(alongContig));

        alongContig = currentContig;
      }
    }

    this.objects.push(genArrow(alongContig));
  }

  public shift(v: number): void {
    this.interval = this.interval.shift(v);

    this.offset = -this.interval.x;

    // this.invalidate();
  }

  public moveTo(pos: number): void {
    this.shift(pos - this.interval.x - this.config.visualPosition.x);
    // this.interval = new Interval(pos, pos + this.interval.size());

    // this.invalidate();
  }

  // public zoom(factor: number): void {
  //   const center = this.config.visible().intersect(this.interval).size() / 2;
  //   const length = center - this.interval.x;
  //   const percent = length / this.interval.size();
  //
  //   this.interval = this.interval.zoom(factor, percent, this.config.visible());
  //
  //   this.offset = -this.interval.x;
  //
  //   this.invalidate();
  // }

  public resize(newLength: number): void {
    const prevSize = this.interval.size() ?? newLength;

    this.interval = new Interval(this.interval.x, this.interval.x + newLength);

    this.invalidate(newLength / prevSize);
  }

  public zoom(newShift: number, newLength: number): void {
    const prevSize = this.interval.size() ?? newLength;

    this.interval = new Interval(0, newLength);
    this.moveTo(newShift);

    this.invalidate(newLength / prevSize);
  }

  public invalidate(factor: number): void {
    this.factor *= factor;

    this.streaks = [];

    const intersect = this.interval;//this.config.visible().intersect(this.interval);
    const start = intersect.x + this.offset;
    const end = intersect.y + this.offset;

    const contigBegin = this.config.acceptValue(start);
    const contigEnd = this.config.acceptValue(end);

    interface collapsedLength {
      readonly real: number;
      readonly v: number;
      readonly power: string;
    }
    const collapseLength = (x: number): collapsedLength => {
      const base = Math.pow(1000, Math.floor(Math.log((contigEnd - contigBegin) / 10) / Math.log(1000)));
      const sub = Math.pow(10, Math.floor(Math.log10((contigEnd - contigBegin) / 10)));

      return {
        real: x,
        v: +(x / base).toFixed(1),
        power: sub >= 10 ** 9 ? "B" : sub >= 10 ** 6 ? "M" : sub >= 10 ** 3 ? "K" : "",
      };
    };

    const genStreak = (
      coord: number,
      collapsedLength: collapsedLength
    ): RouletteObject =>
      new RouletteObject(
        coord,//   - this.offset,
        ROType.STREAK,
        `${collapsedLength.v}${collapsedLength.power}`
      );

    ///// LINE
    this.streaks.push(
      genStreak(start, collapseLength(start)),
      genStreak(end, collapseLength(end))
    );

    ///// STREAKS
    const lengthStep = this.config.visibleLength / 10;
    const contigSizeStep = this.config.acceptValue(this.config.visible().intersect(this.interval).y) / 10;
    let currentStep = 0;
    let beginAt = contigBegin;

    for (let dot = start + 1; dot < end; dot++) {
      const currentLength = collapseLength(this.config.acceptValue(dot));
      currentStep++;

      if (currentStep >= lengthStep && currentLength.real >= beginAt + contigSizeStep) {
        currentStep = 0;
        beginAt = currentLength.real;

        this.streaks.push(genStreak(dot, currentLength));
      }
    }
  }

  public findOnMouse(mouse: number): OnMouseObject | undefined {
    for (const mark of this.objects) {
      // false warning
      // noinspection SuspiciousTypeOfGuard
      if (mark instanceof RouletteLongObject && mark.contig && mark.in(mouse - this.offset)) {
        return {
          position: new Interval(Math.max(0, mark.position - this.offset), mark.position + mark.size - this.offset),
          contig: mark.contig,
        };
      }
    }

    return undefined;
  }

  public draw(
    drawLine: (start: Vector, end: Vector, weight: number) => void,
    drawText: (point: Vector, text: string) => void,
    drawMark: (point: Vector) => void,
    drawPolygon: (points: Array<Vector>, color: string) => void
  ): void {
    this.drawObjects(drawLine, drawPolygon);

    this.drawStreaks(drawLine, drawText, drawMark);
  }

  private drawObjects(
    drawLine: (start: Vector, end: Vector, weight: number) => void,
    drawPolygon: (points: Array<Vector>, color: string) => void
  ): void {
    for (const obj of this.objects) {
      if (!obj.isVisible(this.factor, this.config.visible().shift(this.offset))) {
        continue;
      }

      const pos = this.config.translate(obj.position * this.factor - this.offset);

      switch (obj.type) {
        case ROType.LEFT_ARROW:
        case ROType.RIGHT_ARROW: {
          const arrow = obj as RouletteLongObject;
          const size = arrow.size * this.factor;
          const baseShift = this.config.orient(-15).swap();
          const direction = obj.type == ROType.LEFT_ARROW ? -1 : 1;

          drawLine(
            pos.add(baseShift),
            pos.add(this.config.orient(size)).add(baseShift),
            3
          );
          const arrowLength = size >= 5 ? 5 : size;
          const headBegin = pos.add(
            direction > 0
              ? this.config.orient(size - arrowLength)
              : this.config.orient(arrowLength)
          );
          drawPolygon(
            [
              headBegin.add(this.config.orient(-5).swap()).add(baseShift),
              headBegin.add(this.config.orient(5).swap()).add(baseShift),
              headBegin.add(this.config.orient(arrowLength * direction)).add(baseShift),
            ],
            "#000000"
          );
          break;
        }
        case ROType.NO_DIRECTION_BOX:
        case ROType.FORWARD_BOX:
        case ROType.REVERSED_BOX: {
          const box = obj as RouletteLongObject;
          const begin = pos;
          const end = pos.add(this.config.orient(box.size * this.factor));

          const shift = this.config.orient(
              obj.type === ROType.FORWARD_BOX ? -5
                : obj.type === ROType.NO_DIRECTION_BOX ? -5 / 2
                : 0
            ).swap();

          // If short enough then draw just a line, otherwise polygon
          if (box.size <= 2) {
            drawLine(begin.add(shift), begin.add(shift).add(this.config.orient(5).swap()), box.size)
          } else {
            drawPolygon([
                begin.add(shift),
                end.add(shift),
                end.add(shift).add(this.config.orient(5).swap()),
                begin.add(shift).add(this.config.orient(5).swap()),
              ],
              obj.type === ROType.FORWARD_BOX ? "#FF0000"
                : obj.type === ROType.NO_DIRECTION_BOX ? "#888888"
                : "#0000FF");
          }
          break;
        }
        case ROType.DOT:
          throw `Unsupported type=${obj.type}; position=<${obj.position}>${pos}`;
      }
    }
  }

  private drawStreaks(
    drawLine: (start: Vector, end: Vector, weight: number) => void,
    drawText: (point: Vector, text: string) => void,
    drawMark: (point: Vector) => void
  ): void {
    drawLine(
      this.config.translate(this.interval.x),
      this.config.translate(this.interval.y),
      1
    );

    for (const obj of this.streaks) {
      if (!obj.isVisible(1, this.config.visible().shift(this.offset))) {
        continue;
      }

      const pos = this.config.translate(obj.position - this.offset);
      if (obj.text) {
        drawText(pos, obj.text);
      }

      drawMark(pos);
    }
  }
}
