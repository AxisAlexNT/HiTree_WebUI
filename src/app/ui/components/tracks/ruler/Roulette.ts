import { TracksHolder } from "@/app/ui/components/tracks/ruler/bed-format-parser";

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

class RouletteObject {
  public readonly position: number;
  public readonly type: ROType;
  public readonly text: string | undefined;

  constructor(position: number, type: ROType, text: string | undefined) {
    this.position = position;
    this.type = type;
    this.text = text;
  }
}

class RouletteLongObject extends RouletteObject {
  public readonly size: number;

  constructor(position: number, size: number, type: ROType) {
    super(position, type, undefined);
    this.size = size;
  }
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
  private objects: Array<RouletteObject>;

  constructor(config: RouletteConfig, len: number) {
    this.config = config;
    this.interval = new Interval(0, len);
    this.offset = 0;
    this.objects = [];

    this.invalidate();
  }

  public shift(v: number): void {
    this.interval = this.interval.shift(v);

    this.offset = -this.interval.x;

    console.log(">")
    this.invalidate();
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
    this.interval = new Interval(this.interval.x, this.interval.x + newLength);

    this.invalidate();
  }

  public zoom(newShift: number, newLength: number): void {
    this.interval = new Interval(0, newLength);
    this.moveTo(newShift);

    this.invalidate();
  }

  public invalidate(): void {
    this.objects = [];

    const intersect = this.config.visible().intersect(this.interval);
    const start = intersect.x + this.offset;
    const end = intersect.y + this.offset;

    interface collapsedLength {
      readonly v: number;
      readonly power: string;
    }
    const collapseLength = (x: number): collapsedLength => {
      // const visibleLength = this.config.visibleLength;
      // if (visibleLength > )
      return {
        v: x,
        power: "M",
      };
    };

    const genStreak = (
      coord: number,
      collapsedLength: collapsedLength
    ): RouletteObject =>
      new RouletteObject(
        coord - this.offset,
        ROType.STREAK,
        `${collapsedLength.v}${collapsedLength.power}`
      );

    const genArrow = (contig: Contig): RouletteObject =>
      new RouletteLongObject(
        contig.interval.x - this.offset,
        contig.interval.size(),
        contig.reversed ? ROType.LEFT_ARROW : ROType.RIGHT_ARROW
      );

    ///// LINE
    this.objects.push(
      genStreak(start, collapseLength(start)),
      genStreak(end, collapseLength(end))
    );

    ///// STREAKS & ARROWS
    const step = this.config.visibleLength / 10;
    let currentStep = 0;

    let alongContig = this.config.acceptContig(start);

    for (let dot = start + 1; dot < end; dot++) {
      const currentLength = collapseLength(this.config.acceptValue(dot));
      currentStep++;

      if (currentStep >= step && currentLength.v % 5 == 0) {
        currentStep = 0;
        this.objects.push(genStreak(dot, currentLength));
      }

      const currentContig = this.config.acceptContig(dot);
      if (!alongContig.equals(currentContig)) {
        this.objects.push(genArrow(alongContig));

        alongContig = currentContig;
      }
    }

    this.objects.push(genArrow(alongContig));

    ///// BOX
    for (const track of this.config.trackHolder.tracks) {
      const trackStart = this.config.acceptPixel(track.start) - this.offset;
      const trackEnd = this.config.acceptPixel(track.end) - this.offset;

      if ((intersect.x <= trackStart && trackStart < intersect.y) ||
        (intersect.x < trackEnd && trackEnd <= intersect.y)) {

        const visibleTrack = intersect.intersect(new Interval(trackStart, trackEnd));

        this.objects.push(
          new RouletteLongObject(visibleTrack.x, visibleTrack.size(),
            track.strand === undefined ? ROType.NO_DIRECTION_BOX
              : track.strand === "+" ? ROType.FORWARD_BOX
              : ROType.REVERSED_BOX
          )
        );
      }
    }
  }

  public draw(
    drawLine: (start: Vector, end: Vector, weight: number) => void,
    drawText: (point: Vector, text: string) => void,
    drawMark: (point: Vector) => void,
    drawPolygon: (points: Array<Vector>, color: string) => void
  ): void {
    const intersect = this.config.visible().intersect(this.interval);

    drawLine(
      this.config.translate(intersect.x),
      this.config.translate(intersect.y),
      1
    );

    for (const obj of this.objects) {
      const pos = this.config.translate(obj.position);
      if (obj.text) {
        drawText(pos, obj.text);
      }

      switch (obj.type) {
        case ROType.STREAK:
          drawMark(pos);
          break;
        case ROType.LEFT_ARROW:
        case ROType.RIGHT_ARROW: {
          const arrow = obj as RouletteLongObject;
          const baseShift = this.config.orient(-15).swap();
          const direction = obj.type == ROType.LEFT_ARROW ? -1 : 1;

          drawLine(
            pos.add(baseShift),
            pos.add(this.config.orient(arrow.size)).add(baseShift),
            3
          );
          const arrowLength = arrow.size >= 5 ? 5 : arrow.size;
          const headBegin = pos.add(
            direction > 0
              ? this.config.orient(arrow.size - arrowLength)
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
          const end = pos.add(this.config.orient(box.size));

          const shift = this.config.orient(
              obj.type === ROType.FORWARD_BOX ? -5
                : obj.type === ROType.NO_DIRECTION_BOX ? -5 / 2
                : 0
            ).swap();

          drawPolygon([
              begin.add(shift),
              end.add(shift),
              end.add(shift).add(this.config.orient(5).swap()),
              begin.add(shift).add(this.config.orient(5).swap()),
            ],
            obj.type === ROType.FORWARD_BOX ? "#FF0000"
            : obj.type === ROType.NO_DIRECTION_BOX ? "#888888"
            : "#0000FF");
          break;
        }
        case ROType.DOT:
          throw `Unsupported type=${obj.type}; position=<${obj.position}>${pos}`;
      }
    }
  }
}
