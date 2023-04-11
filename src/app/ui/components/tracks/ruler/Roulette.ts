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

enum ROType {
  STREAK,
  DOT,
  BOX,
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

export class RouletteConfig {
  public readonly visualPosition: Vector;
  public visibleLength: number;
  public readonly horizontal: boolean;
  public acceptValue: (point: number) => number;

  constructor(
    visualPosition: Vector,
    visibleLength: number,
    horizontal: boolean,
    acceptValue: (point: number) => number
  ) {
    this.visualPosition = visualPosition;
    this.visibleLength = visibleLength;
    this.horizontal = horizontal;
    this.acceptValue = acceptValue;
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
}

export class Roulette {
  private readonly config: RouletteConfig;
  private interval: Interval;
  private offset: number;
  private readonly step: number;
  private objects: Array<RouletteObject>;

  constructor(config: RouletteConfig, len: number, step: number) {
    this.config = config;
    this.interval = new Interval(0, len);
    this.offset = 0;
    this.step = step;
    this.objects = [];

    this.invalidate();
  }

  public shift(v: number): void {
    this.interval = this.interval.shift(v);

    this.offset = -this.interval.x;

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

    const genStreak = (coord: number): RouletteObject =>
      new RouletteObject(
        coord - this.offset,
        ROType.STREAK,
        Math.round(this.config.acceptValue(coord)).toString()
      );

    this.objects.push(genStreak(start), genStreak(end));

    let last = this.config.acceptValue(start);
    let value = last % this.step;
    for (let dot = start + 1; dot < end; dot++) {
      value += this.config.acceptValue(dot) - last;

      last = this.config.acceptValue(dot);

      if (value >= this.step) {
        this.objects.push(genStreak(dot));
        value = value % this.step;
      }
    }
  }

  public draw(
    drawLine: (start: Vector, end: Vector) => void,
    drawText: (point: Vector, text: string) => void,
    drawMark: (point: Vector) => void
  ): void {
    const intersect = this.config.visible().intersect(this.interval);

    drawLine(
      this.config.translate(intersect.x),
      this.config.translate(intersect.y)
    );

    for (const obj of this.objects) {
      const pos = this.config.translate(obj.position);
      if (obj.text) {
        drawText(pos.add(new Vector(0, -15)), obj.text);
      }

      switch (obj.type) {
        case ROType.STREAK:
          drawMark(pos);
          break;
        case ROType.DOT:
        case ROType.BOX:
        case ROType.LEFT_ARROW:
        case ROType.RIGHT_ARROW:
          throw `Unsupported {type=${obj.type}; position=<${obj.position}>${pos}`;
      }
    }
  }
}
