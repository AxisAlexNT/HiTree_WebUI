import { Interval, Vector } from "@/app/core/roulette/tuple";
import { TrackManager } from "@/app/core/roulette/BedParser";
import { floor } from "ol/math";

//<editor-fold desc="> Roulette object">

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace RO /* roulette object */ {
  export enum TypeRO {
    PERIOD_STREAK,
    HALF_STREAK,
    TICK,
    // DOT,
    NO_DIRECTION_BOX,
    FORWARD_BOX,
    REVERSED_BOX,
    DIAGRAM_COLUMN,
  }

  export abstract class RouletteObject<T extends TypeRO> {
    readonly pos: number;
    readonly color: string;
    readonly type: T;

    protected constructor(pos: number, type: T, color: string) {
      this.pos = pos;
      this.color = color;
      this.type = type;
    }

    public toString(): string {
      return `{pos: ${this.pos}, type: ${this.type}}`;
    }
  }

  export type TickType =
    | TypeRO.PERIOD_STREAK
    | TypeRO.HALF_STREAK
    | TypeRO.TICK;
  export type BoxType =
    | TypeRO.FORWARD_BOX
    | TypeRO.REVERSED_BOX
    | TypeRO.NO_DIRECTION_BOX;
  export type DiagramType = TypeRO.DIAGRAM_COLUMN;

  export class TextRO extends RouletteObject<TickType> {
    readonly text: string;

    constructor(pos: number, text: string, type: TickType, color: string) {
      super(pos, type, color);
      this.text = text;
    }
  }

  export class LongRO extends RouletteObject<BoxType> {
    readonly size: number;

    constructor(pos: number, size: number, type: BoxType, color: string) {
      super(pos, type, color);
      this.size = size;
    }
  }

  export class AreaRO extends RouletteObject<DiagramType> {
    readonly width: number;
    readonly height: number;

    constructor(
      pos: number,
      width: number,
      height: number,
      type: DiagramType,
      color: string
    ) {
      super(pos, type, color);
      this.width = width;
      this.height = height;
    }
  }
}

class RouletteObject extends RO.RouletteObject<RO.TypeRO> {}
const TypeRO = RO.TypeRO;
class TextRO extends RO.TextRO {}
class LongRO extends RO.LongRO {}
class AreaRO extends RO.AreaRO {}

//</editor-fold>

export interface Contig {
  readonly interval: Interval;
  readonly reversed: boolean;
}

export class RouletteConfig {
  public readonly horizontal: RouletteOrientation;
  public pixelToValue: (point: number) => number;
  public valueToPixel: (value: number) => number;
  public pixelToContig: (point: number) => Contig;

  constructor(
    horizontal: RouletteOrientation,
    pixelToValue: (point: number) => number,
    valueToPixel: (value: number) => number,
    pixelToContig: (point: number) => Contig
  ) {
    this.horizontal = horizontal;
    this.pixelToValue = pixelToValue;
    this.valueToPixel = valueToPixel;
    this.pixelToContig = pixelToContig;
  }

  public orient(d: number): Vector {
    return this.horizontal === RouletteOrientation.HORIZONTAL
      ? new Vector(d, 0)
      : new Vector(0, d);
  }
}

export class RouletteLayerConfig {
  public readonly visualPosition: Vector;
  public visibleLength: number;
  public readonly rouletteConfig: RouletteConfig;

  constructor(
    visualPosition: Vector,
    visibleLength: number,
    config: RouletteConfig
  ) {
    this.visualPosition = visualPosition;
    this.visibleLength = visibleLength;
    this.rouletteConfig = config;
  }

  public visible(): Interval {
    return new Interval(0, this.visibleLength);
  }

  public translate(c: number): Vector {
    return this.rouletteConfig.orient(c).add(this.visualPosition);
  }
}

class RouletteState {
  private _interval: Interval;
  private _offset: number;
  private _factor: number;

  constructor() {
    this._offset = 0;
    this._factor = 1;
    this._interval = new Interval(0, 0);
  }

  get interval(): Interval {
    return this._interval;
  }

  get offset(): number {
    return this._offset;
  }

  get factor(): number {
    return this._factor;
  }

  public shift(d: number): void {
    this._interval = this._interval.shift(d);
    this._offset -= d;
  }

  public zoom(d: number): void {
    this._factor *= d;
  }

  public resize(size: number): void {
    this._interval = this._interval.resize(size);
  }
}

//<editor-fold desc="> Roulette layer">
// FAIL WARNINGS
/* eslint-disable */
namespace RLN /* roulette layer namespace */ {
  export const glossary: Map<string, (config: RouletteConfig, state: RouletteState) => RouletteLayer<RouletteObject>> = new Map();

  export function register<
    T extends RouletteObject,
    C extends new (config: RouletteConfig, state: RouletteState) => RouletteLayer<T>
  >(cnstr: C): void {
    glossary.set(
      cnstr.name,
      (config: RouletteConfig, state: RouletteState) => new cnstr(config, state)
    );
  }

  class LayerConfigTempWrapper extends RouletteLayerConfig {}

  export abstract class RouletteLayer<T extends RouletteObject> {
    public readonly name: string;
    protected readonly objects: Array<T>;
    protected _layerConfig: RouletteLayerConfig;
    protected readonly state: RouletteState;
    public initialized: boolean = false;

    protected constructor(
      name: string,
      config: RouletteConfig,
      state: RouletteState
    ) {
      this.name = name;
      this.objects = [];
      this._layerConfig = new LayerConfigTempWrapper(new Vector(-1, -1), -1, config);
      this.state = state;
    }

    public setLayerConfig(visualPosition: Vector, visualLength: number): void {
      this._layerConfig = new RouletteLayerConfig(visualPosition, visualLength, this._layerConfig.rouletteConfig);

      this.init();
    }

    get layerConfig(): RouletteLayerConfig {
      if (this._layerConfig instanceof LayerConfigTempWrapper) {
        throw new Error(`Uninitialized "${this.name}"!`);
      }

      return this._layerConfig;
    }

    public baseShift(): Vector {
      return this.layerConfig.translate(0);
    }

    public isHorizontal(): boolean {
      return this.layerConfig.rouletteConfig.horizontal === RouletteOrientation.HORIZONTAL;
    }

    public init(): void {
      if (this.initialized) {
        return;
      }

      this.initImpl();
      this.initialized = true;
    }

    protected initImpl(): void {}

    public invalidate(): void {
      this.initImpl();
    }

    public draw(
      drawLine: (start: Vector, end: Vector) => void,
      drawText: (point: Vector, text: string) => void,
      drawMark: (point: Vector) => void,
      // eslint-disable-next-line
      drawPolygon: (points: Array<Vector>, borders: boolean) => void,
      setColor: (color: string) => void
    ): void {
      for (const obj of this.objects) {
        this.drawItem(obj, drawLine, drawText, drawMark, drawPolygon, setColor);
      }
    }

    protected abstract drawItem(
      obj: T,
      drawLine: (start: Vector, end: Vector) => void,
      drawText: (point: Vector, text: string) => void,
      drawMark: (point: Vector) => void,
      // eslint-disable-next-line
      drawPolygon: (points: Array<Vector>, borders: boolean) => void,
      setColor: (color: string) => void
    ): void;
  }

  @RLN.register
  export class EmptyRC extends RouletteLayer<never> {
    constructor(config: RouletteConfig, state: RouletteState) {
      super("empty", config, state);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    initImpl() {
      throw new Error("Empty layer found!")
    }

    drawItem() {
      throw "Empty level found!";
    }
  }

  @RLN.register
  export class TicksRC extends RouletteLayer<TextRO> {
    constructor(config: RouletteConfig, state: RouletteState) {
      super("ticks", config, state);
    }

    public collapseLength(x: number, visibleLength: number): collapsedLength {
      const base = Math.pow(
        1000,
        Math.floor(Math.log(visibleLength / 10) / Math.log(1000))
      );
      const sub = Math.pow(10, Math.floor(Math.log10(visibleLength / 10)));

      return {
        real: x,
        v: +(x / base).toFixed(3),
        power:
          sub >= 10 ** 9 ? "B" : sub >= 10 ** 6 ? "M" : sub >= 10 ** 3 ? "K" : "",
      };
    }

    private createTick(pos: number, type: RO.TickType): TextRO {
      // visible start, visible end
      const [vs, ve] = this.layerConfig.visible().intersect(this.state.interval).shift(this.state.offset).coords();
      const start = this.layerConfig.rouletteConfig.pixelToValue(vs);
      const end = this.layerConfig.rouletteConfig.pixelToValue(ve);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { real, v, power } = this.collapseLength(
        this.layerConfig.rouletteConfig.pixelToValue(pos + this.state.offset),
        end - start
      );

      return new TextRO(pos + this.state.offset , `${v}${power}`, type, "#000000");
    }

    protected initImpl() {
      // fixme cheat to empty the array
      this.objects.length = 0;

      const [start, end] = this.state.interval.coords();

      const amount = 3 * /* DO NOT CHANGE 10 */ 10;
      const step = (end - start) / amount;

      for (let i = 0; i <= amount; i++) {
        const tickType =
          i % 10 == 0 ? TypeRO.PERIOD_STREAK
            : i % 5 == 0 ? TypeRO.HALF_STREAK
              : TypeRO.TICK;

        this.objects.push(this.createTick(floor(start + step * i, 0), tickType));
      }
    }

    protected drawItem(
      obj: TextRO,
      drawLine: (start: Vector, end: Vector) => void,
      drawText: (point: Vector, text: string) => void,
      drawMark: (point: Vector) => void,
      // eslint-disable-next-line
      drawPolygon: (points: Array<Vector>, borders: boolean) => void,
      setColor: (color: string) => void,
    ) {
      const pos = this.layerConfig.translate(obj.pos - this.state.offset)
        .add(this.layerConfig.rouletteConfig.orient(10).swap());

      setColor(obj.color);
      const length = new Map([
        [RO.TypeRO.PERIOD_STREAK, 20],
        [RO.TypeRO.HALF_STREAK, 10],
        [RO.TypeRO.TICK, 5],
      ]).get(obj.type) ?? 0;
      const shift = this.layerConfig.rouletteConfig.orient(-length).swap();

      drawLine(pos, pos.add(shift))

      if ([RO.TypeRO.PERIOD_STREAK, RO.TypeRO.HALF_STREAK].includes(obj.type)) {
        drawText(pos, obj.text);
      }
    }
  }

  // @RLN.register
  // export class TracksRC extends RouletteLayer<LongRO> {
  //   constructor() {
  //     super("tracks");
  //   }
  // }
  //
  // @RLN.register
  // export class DiagramRC extends RouletteLayer<AreaRO> {
  //   constructor() {
  //     super("diagram");
  //   }
  // }
}
/* eslint-enable */

// eslint-disable-next-line prettier/prettier
export abstract class RouletteLayer extends RLN.RouletteLayer<RouletteObject> {}
export class EmptyRC extends RLN.EmptyRC {}
export class TicksRC extends RLN.TicksRC {}
//</editor-fold>

export class RouletteComponent {
  public readonly name: string;
  private readonly _layers: Map<string, RouletteLayer>;

  constructor(
    trackManager: TrackManager,
    config: RouletteConfig,
    state: RouletteState
  ) {
    this.name = trackManager.filename;
    this._layers = new Map();

    this.init(trackManager, config, state);
  }

  init(
    trackManager: TrackManager,
    config: RouletteConfig,
    state: RouletteState
  ) {
    this._layers.set("ticks", new TicksRC(config, state));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // for (const [_, layer] of this._layers) {
    //   layer.init();
    // }
  }

  // public appendLevel(name: string): void {
  //   const unreachable = (): never => {
  //     throw "unreachable";
  //   };
  //
  //   const componentConstructor =
  //     RLN.glossary.get(name) ?? RLN.glossary.get(EmptyRC.name) ?? unreachable();
  //
  //   this._components.push(componentConstructor(this.config, this.state));
  // }

  get layers(): Map<string, RouletteLayer> {
    return this._layers;
  }

  invalidate() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, layer] of this._layers) {
      if (layer.initialized) {
        layer.invalidate();
      }
    }
  }
}

export interface collapsedLength {
  readonly real: number;
  readonly v: number;
  readonly power: string;
}

export enum RouletteOrientation {
  HORIZONTAL,
  VERTICAL,
}

export class Roulette {
  private readonly config: RouletteConfig;
  private readonly state: RouletteState;
  private readonly _ticks: TicksRC;
  private readonly _components: Array<RouletteComponent>;
  public initialized = false;

  constructor(config: RouletteConfig) {
    this.config = config;
    this.state = new RouletteState();
    this._components = [];

    this._ticks = new TicksRC(this.config, this.state);
  }

  public addComponent(trackManager: TrackManager): void {
    this._components.push(
      new RouletteComponent(trackManager, this.config, this.state)
    );
  }

  get components(): Array<RouletteComponent> {
    return this._components;
  }

  get ticks(): RouletteLayer {
    return this._ticks;
  }

  public shift(d: number): void {
    this.state.shift(d);
  }

  public moveTo(newShift: number): void {
    this.shift(newShift - this.state.interval.x);
  }

  public scale(d: number): void {
    this.state.zoom(d);

    this.invalidate();
  }

  public zoom(newShift: number, newLength: number): void {
    const prevSize = this.state.interval.size() ?? newLength;

    this.moveTo(newShift);
    this.state.resize(newLength);

    this.scale(newLength / prevSize);
  }

  public resize(size: number): void {
    this.zoom(this.state.interval.x, size);
  }

  public init(): void {
    if (this.initialized) {
      return;
    }

    // do nothing

    this.initialized = true;
  }

  public invalidate(): void {
    if (this.ticks.initialized) {
      this.ticks.invalidate();
    }

    for (const component of this._components) {
      component.invalidate();
    }
  }
}
