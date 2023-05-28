import { Interval, Vector } from "@/app/core/roulette/tuple";
import { TrackManager } from "@/app/core/roulette/BedParser";

enum TypeRO {
  // STREAK,
  // DOT,
  NO_DIRECTION_BOX,
  FORWARD_BOX,
  REVERSED_BOX,
  DIAGRAM_COLUMN,
}

abstract class RouletteObject {
  readonly pos: number;
  readonly color: string;

  protected constructor(pos: number, color: string) {
    this.pos = pos;
    this.color = color;
  }
}

class TextRO extends RouletteObject {
  readonly text: string;

  constructor(pos: number, text: string, color: string) {
    super(pos, color);
    this.text = text;
  }
}

class LongRO extends RouletteObject {
  readonly size: number;
  readonly type: TypeRO;

  constructor(
    pos: number,
    size: number,
    type: TypeRO.FORWARD_BOX | TypeRO.REVERSED_BOX | TypeRO.NO_DIRECTION_BOX,
    color: string
  ) {
    super(pos, color);
    this.size = size;
    this.type = type;
  }
}

class AreaRO extends RouletteObject {
  readonly width: number;
  readonly height: number;
  readonly type: TypeRO;

  constructor(
    pos: number,
    width: number,
    height: number,
    type: TypeRO.DIAGRAM_COLUMN,
    color: string
  ) {
    super(pos, color);
    this.width = width;
    this.height = height;
    this.type = type;
  }
}

export interface Contig {
  readonly interval: Interval;
  readonly reversed: boolean;
}

export class RouletteConfig {
  public readonly visualPosition: Vector;
  public visibleLength: number;
  public readonly horizontal: RouletteOrientation;
  public pixelToValue: (point: number) => number;
  public valueToPixel: (value: number) => number;
  public pixelToContig: (point: number) => Contig;
  public trackManager: TrackManager;

  constructor(
    visualPosition: Vector,
    visibleLength: number,
    horizontal: RouletteOrientation,
    pixelToValue: (point: number) => number,
    valueToPixel: (value: number) => number,
    pixelToContig: (point: number) => Contig,
    trackManager: TrackManager
  ) {
    this.visualPosition = visualPosition;
    this.visibleLength = visibleLength;
    this.horizontal = horizontal;
    this.pixelToValue = pixelToValue;
    this.valueToPixel = valueToPixel;
    this.pixelToContig = pixelToContig;
    this.trackManager = trackManager;
  }

  public visible(): Interval {
    return new Interval(0, this.visibleLength);
  }

  public orient(d: number): Vector {
    return this.horizontal == RouletteOrientation.HORIZONTAL
      ? new Vector(d, 0)
      : new Vector(0, d);
  }

  public translate(c: number): Vector {
    return this.orient(c).add(this.visualPosition);
  }
}

export abstract class RouletteComponent<T extends RouletteObject> {
  public readonly name: string;
  protected readonly objects: Array<T>;
  protected readonly config: RouletteConfig;

  protected constructor(name: string, config: RouletteConfig) {
    this.name = name;
    this.objects = [];
    this.config = config;
  }

  public baseShift(): Vector {
    return this.config.translate(0);
  }

  public isHorizontal(): boolean {
    return this.config.horizontal == RouletteOrientation.HORIZONTAL;
  }

  public abstract draw(
    drawLine: (start: Vector, end: Vector, color: string) => void,
    drawText: (point: Vector, text: string) => void,
    drawMark: (point: Vector) => void,
    // eslint-disable-next-line
    drawPolygon: (points: Array<Vector>, color: string, borders: boolean) => void,
    setColor: (color: string) => void
  ): void;
}

export class EmptyRC extends RouletteComponent<never> {
  constructor(config: RouletteConfig) {
    super("empty", config);
  }

  draw(): void {
    console.log("Empty level found!");
  }
}

export class TicksRC extends RouletteComponent<TextRO> {
  constructor() {
    super("ticks");
  }

  draw(
    drawLine: (start: Vector, end: Vector, color: string) => void,
    drawText: (point: Vector, text: string) => void,
    drawMark: (point: Vector) => void,
    // eslint-disable-next-line
    drawPolygon: (points: Array<Vector>, color: string, borders: boolean) => void,
    setColor: (color: string) => void,
  ): void {
    for (const obj of this.objects) {
      const pos = this.config.translate(obj.pos);
      setColor(obj.color);
      drawMark(pos);
      drawText(pos, obj.text);
    }
  }
}

// export class TracksRC extends RouletteComponent<LongRO> {
//   constructor() {
//     super("tracks");
//   }
// }
//
// export class DiagramRC extends RouletteComponent<AreaRO> {
//   constructor() {
//     super("diagram");
//   }
// }

export enum RouletteOrientation {
  HORIZONTAL,
  VERTICAL,
}

export class Roulette {
  private interval: Interval;
  private config: RouletteConfig;
  private offset: number;
  private factor: number;
  private components: Map<string, RouletteComponent<RouletteObject>>;

  constructor(config: RouletteConfig) {
    this.components = new Map();
    this.offset = 0;
    this.factor = 1;
    this.config = config;
    this.interval = new Interval(0, 0);

    this.appendLevel(new TicksRC());
  }

  public appendLevel(level: RouletteComponent<RouletteObject>): void {
    this.components.set(level.name, level);
  }

  public layers(): Array<RouletteComponent<RouletteObject>> {
    return [...this.components.values()];
  }

  public level<T extends RouletteObject>(name: string): RouletteComponent<T> {
    // eslint-disable-next-line prettier/prettier
    return (this.components.get(name) as RouletteComponent<T>) ?? new EmptyRC(this.config);
  }

  public shift(d: number): void {
    this.interval = this.interval.shift(d);
  }

  public moveTo(newShift: number): void {
    this.shift(newShift - this.interval.x);
  }

  public scale(d: number): void {
    this.factor *= d;

    this.invalidate();
  }

  public zoom(newShift: number, newLength: number): void {
    const prevSize = this.interval.size() ?? newLength;

    this.moveTo(newShift);

    this.scale(newLength / prevSize);
  }

  public init(): void {

  }

  public invalidate(): void {

  }
}
