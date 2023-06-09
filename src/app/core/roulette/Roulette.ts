import { Interval, Vector } from "@/app/core/roulette/tuple";
import {
  ChromosomeDescription,
  TrackManager,
} from "@/app/core/roulette/BedParser";
import { floor } from "ol/math";
import { defaultTrackManager } from "@/app/ui/components/tracks/AbstractRouletteBrowser";

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
    CHROMOSOME_TICK,
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
  export type ChromosomeType = TypeRO.CHROMOSOME_TICK;
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
    readonly chr: ChromosomeDescription;

    constructor(pos: number, size: number, chr: ChromosomeDescription) {
      super(
        pos,
        chr.strand === "+" ? RO.TypeRO.FORWARD_BOX
          : chr.strand === "-" ? RO.TypeRO.REVERSED_BOX
          : RO.TypeRO.NO_DIRECTION_BOX,
        chr.strand === "+" ? "#cc0000"
          : chr.strand === "-" ? "#0000cc"
          : "#888888"
      );

      this.chr = chr;
      this.size = size;
    }
  }

  export class ChromosomeRO extends RouletteObject<ChromosomeType> {
    readonly size: number;
    readonly name: string;

    constructor(pos: number, size: number, name: string) {
      super(pos, TypeRO.CHROMOSOME_TICK, "#000000");
      this.size = size;
      this.name = name;
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
class ChromosomeRO extends RO.ChromosomeRO {}
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
  export const glossary: Map<string, (config: RouletteConfig, state: RouletteState, trackManager: TrackManager) => RouletteLayer<RouletteObject>> = new Map();

  export function register<
    T extends RouletteObject,
    C extends new (config: RouletteConfig, state: RouletteState, trackManager: TrackManager) => RouletteLayer<T>
  >(cnstr: C): void {
    glossary.set(
      cnstr.name,
      (config: RouletteConfig, state: RouletteState, trackManager: TrackManager) => new cnstr(config, state, trackManager)
    );
  }

  class LayerConfigTempWrapper extends RouletteLayerConfig {}

  export abstract class RouletteLayer<T extends RouletteObject> {
    public readonly name: string;
    protected readonly objects: Array<T>;
    protected _layerConfig: RouletteLayerConfig;
    protected readonly state: RouletteState;
    protected readonly trackManager: TrackManager;
    public initialized: boolean = false;

    protected constructor(
      name: string,
      config: RouletteConfig,
      state: RouletteState,
      trackManager: TrackManager
    ) {
      this.name = name;
      this.objects = [];
      this._layerConfig = new LayerConfigTempWrapper(new Vector(-1, -1), -1, config);
      this.state = state;
      this.trackManager = trackManager;
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

    protected abstract initImpl(): void;

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
        setColor(obj.color);
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
    constructor(config: RouletteConfig, state: RouletteState, trackManager: TrackManager) {
      super("empty", config, state, trackManager);
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
    constructor(config: RouletteConfig, state: RouletteState, trackManager: TrackManager) {
      super("ticks", config, state, trackManager);
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

      const length = new Map([
        [RO.TypeRO.PERIOD_STREAK, 20],
        [RO.TypeRO.HALF_STREAK, 10],
        [RO.TypeRO.TICK, 5],
      ]).get(obj.type) ?? 0;
      const shift = this.layerConfig.rouletteConfig.orient(-length).swap();

      drawLine(pos, pos.add(shift))

      if ([RO.TypeRO.PERIOD_STREAK, RO.TypeRO.HALF_STREAK].includes(obj.type)) {
        drawText(pos, obj.text + "bp");
      }
    }
  }

  @RLN.register
  export class TracksRC extends RouletteLayer<LongRO> {
    constructor(config: RouletteConfig, state: RouletteState, trackManager: TrackManager) {
      super("tracks", config, state, trackManager);
    }

    initImpl() {
      let shift = 0;

      for (const chromosome of this.trackManager.genome) {
        for (const description of chromosome.description) {
          const trackStart = this.layerConfig.rouletteConfig.valueToPixel(description.start + shift);
          const trackEnd = this.layerConfig.rouletteConfig.valueToPixel(description.end + shift);

          this.objects.push(new LongRO(trackStart, trackEnd - trackStart, description));
        }

        shift += chromosome.length();
      }
    }

    invalidate() {
      // do nothing
    }

    protected drawItem(
      obj: LongRO,
      drawLine: (start: Vector, end: Vector) => void,
      drawText: (point: Vector, text: string) => void,
      drawMark: (point: Vector) => void,
      // eslint-disable-next-line
      drawPolygon: (points: Array<Vector>, borders: boolean) => void,
      setColor: (color: string) => void,
    ) {
      const baseShift = this.layerConfig.rouletteConfig.orient(
        obj.type === TypeRO.FORWARD_BOX ? -10
          : obj.type === TypeRO.REVERSED_BOX ? -5
            : 0
      ).swap()

      const pos = this.layerConfig.translate(obj.pos * this.state.factor - this.state.offset);

      const h = this.layerConfig.rouletteConfig.orient(obj.size * this.state.factor);
      const w = this.layerConfig.rouletteConfig.orient(5).swap();

      drawPolygon([
        pos.add(baseShift),
        pos.add(baseShift).add(h),
        pos.add(baseShift).add(h).add(w),
        pos.add(baseShift).add(w)
      ], true);

      const name = obj.chr.name as (string | undefined);

      if (name && obj.size >= 40) {
        drawText(pos.add(this.layerConfig.rouletteConfig.orient(10).swap()), name);
      }
    }
  }

  @RLN.register
  export class ChromosomeRC extends RouletteLayer<ChromosomeRO> {
    constructor(config: RouletteConfig, state: RouletteState, trackManager: TrackManager) {
      super("tracks", config, state, trackManager);
    }

    initImpl() {
      let shift = 0;

      for (const chromosome of this.trackManager.genome) {
        const trackStart = this.layerConfig.rouletteConfig.valueToPixel(shift);
        const trackEnd = this.layerConfig.rouletteConfig.valueToPixel(shift + chromosome.length());

        this.objects.push(new ChromosomeRO(trackStart, trackEnd - trackStart, chromosome.name));

        shift += chromosome.length();
      }
    }

    invalidate() {
      // do nothing
    }

    draw(
      drawLine: (start: Vector, end: Vector) => void,
      drawText: (point: Vector, text: string) => void,
      drawMark: (point: Vector) => void,
      // eslint-disable-next-line
      drawPolygon: (points: Array<Vector>, borders: boolean) => void,
      setColor: (color: string) => void,
    ) {
      const pos = this.layerConfig.translate(0 - this.state.offset);
      const baseShift = this.layerConfig.rouletteConfig.orient(-10).swap();

      drawLine(pos, pos.add(baseShift));

      super.draw(drawLine, drawText, drawMark, drawPolygon, setColor);
    }

    protected drawItem(
      obj: ChromosomeRO,
      drawLine: (start: Vector, end: Vector) => void,
      drawText: (point: Vector, text: string) => void,
      drawMark: (point: Vector) => void,
      // eslint-disable-next-line
      drawPolygon: (points: Array<Vector>, borders: boolean) => void,
      setColor: (color: string) => void,
    ) {
      const halfLength = this.layerConfig.rouletteConfig.orient(obj.size * this.state.factor / 2);

      const pos = this.layerConfig.translate(obj.pos * this.state.factor - this.state.offset)
        .add(halfLength).add(halfLength);

      const baseShift = this.layerConfig.rouletteConfig.orient(-10).swap();

      drawLine(pos, pos.add(baseShift));
      drawText(pos.add(baseShift.opposite()).add(halfLength.opposite()), obj.name);
    }
  }

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
export class TracksRC extends RLN.TracksRC {}
export class ChromosomeRC extends RLN.ChromosomeRC {}
//</editor-fold>

export class RouletteComponent {
  public readonly name: string;
  private readonly _layers: Map<string, RouletteLayer>;

  constructor(
    config: RouletteConfig,
    state: RouletteState,
    trackManager: TrackManager
  ) {
    this.name = trackManager.filename;
    this._layers = new Map();

    this.init(config, state, trackManager);
  }

  init(
    config: RouletteConfig,
    state: RouletteState,
    trackManager: TrackManager
  ) {
    this._layers.set("ticks", new TicksRC(config, state, trackManager));
    this._layers.set("chromosomes", new ChromosomeRC(config, state, trackManager));
    this._layers.set("tracks", new TracksRC(config, state, trackManager));
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

    this._ticks = new TicksRC(this.config, this.state, defaultTrackManager);
  }

  public addComponent(trackManager: TrackManager): void {
    this._components.push(
      new RouletteComponent(this.config, this.state, trackManager)
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
    let prevSize = this.state.interval.size();

    if (prevSize === 0) {
      prevSize = newLength;
    }

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
