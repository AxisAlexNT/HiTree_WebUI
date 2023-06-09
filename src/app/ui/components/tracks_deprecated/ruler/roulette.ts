// export class Interval {
//   public from: number;
//   public to: number;
//
//   constructor(from: number, to: number) {
//     this.from = from;
//     this.to = to;
//   }
//
//   public shift(d: number): Interval {
//     return new Interval(this.from + d, this.to + d);
//   }
//
//   /**
//    * scales the interval in proportions
//    * @param d scale factor
//    * @param p percent length from the left bound (this.from)
//    * <p>40%: <code>|- - - * - - - - - -|</code></p>
//    * <p><code>[-1, 3].scale(2, 0.25) = [-2, 6]</code></p>
//    */
//   public scale(d: number, p: number): Interval {
//     const center = this.from + this.size() * p;
//     const leftSize = center - this.from;
//     const rightSize = this.to - center;
//     return new Interval(center - leftSize * d, center + rightSize * d);
//   }
//
//   public size(): number {
//     return this.to - this.from;
//   }
//
//   public merge(other: Interval): Interval {
//     return new Interval(
//       Math.min(this.from, other.from),
//       Math.max(this.to, other.to)
//     );
//   }
//
//   public intersect(other: Interval): Interval {
//     const start = Math.max(this.from, other.from);
//     const end = Math.min(this.to, other.to);
//
//     if (start < end) {
//       return new Interval(start, end);
//     } else {
//       return new Interval(end - 1, end);
//     }
//   }
//
//   public toString(): string {
//     return `[${this.from}, ${this.to}]`;
//   }
// }
//
// export class Point extends Interval {
//   public add(other: Point): Point {
//     return new Point(this.from + other.from, this.to + other.to);
//   }
//
//   public static of(v: number, horizontal: boolean): Point {
//     return horizontal ? new Point(v, 0) : new Point(0, v);
//   }
// }
//
// enum ROType {
//   STREAK,
//   DOT,
//   BOX,
//   LEFT_ARROW,
//   RIGHT_ARROW,
// }
//
// class RouletteObject {
//   public readonly position: Point;
//   public readonly type: ROType;
//   public readonly text: string | undefined;
//
//   constructor(position: Point, type: ROType, text: string | undefined) {
//     this.position = position;
//     this.type = type;
//     this.text = text;
//   }
// }
//
// export class RouletteValidator {
//   public readonly isHorizontal: boolean;
//   public readonly position: Point;
//   public readonly acceptValue: (point: number) => number;
//
//   public translate(pos: number | Point): Point {
//     if (typeof pos === "number") {
//       return Point.of(pos, this.isHorizontal).add(this.position);
//     }
//
//     return pos.add(this.position);
//   }
//
//   constructor(
//     position: Point,
//     isHorizontal: boolean,
//     acceptValue: (point: number) => number
//   ) {
//     this.position = position;
//     this.isHorizontal = isHorizontal;
//     this.acceptValue = acceptValue;
//   }
// }
//
// export class Roulette {
//   private readonly visible: Interval;
//   private readonly step: number;
//   private readonly validator: RouletteValidator;
//   private total: Interval;
//   private offset: number;
//   private objects: Array<RouletteObject>;
//
//   constructor(
//     visible: Interval,
//     start: number,
//     length: number,
//     step: number,
//     validator: RouletteValidator
//   ) {
//     this.visible = visible;
//     this.step = step;
//     this.validator = validator;
//     this.total = new Interval(start, start + length);
//     this.offset = 0;
//
//     this.objects = new Array<RouletteObject>();
//     this.invalidate();
//   }
//
//   public moveTo(d: number): void {
//     this.shift(d - this.total.from);
//   }
//
//   public shift(d: number): void {
//     if (this.total.size() >= this.visible.size()) {
//       this.offset += d;
//     } else {
//       this.total = this.total.shift(d);
//     }
//
//     this.invalidate();
//   }
//
//   public scale(d: number, p: number): void {
//     this.total = this.total.scale(d, p);
//
//     this.invalidate();
//   }
//
//   public invalidate(): void {
//     this.objects = [];
//
//     const intersect = this.visible.intersect(this.total);
//     const start = intersect.from;
//     const end = intersect.to;
//
//     const genStreak = (coord: number): RouletteObject =>
//       new RouletteObject(
//         Point.of(coord + this.offset, this.validator.isHorizontal),
//         ROType.STREAK,
//         this.validator.acceptValue(coord).toString()
//       );
//
//     this.objects.push(genStreak(start), genStreak(end));
//
//     let last = this.validator.acceptValue(start);
//     let value = last % this.step;
//     for (let dot = start + 1; dot < end; dot++) {
//       value += this.validator.acceptValue(dot) - last;
//       last = this.validator.acceptValue(dot);
//
//       if (value >= this.step) {
//         this.objects.push(genStreak(dot));
//         value = value % this.step;
//       }
//     }
//   }
//
//   public draw(
//     drawLine: (start: Point, end: Point) => void,
//     drawText: (point: Point, text: string) => void,
//     drawMark: (point: Point) => void
//   ): void {
//     const intersect = this.visible.intersect(this.total);
//
//     drawLine(
//       this.validator.translate(intersect.from),
//       this.validator.translate(intersect.to)
//     );
//
//     for (const obj of this.objects) {
//       if (obj.text) {
//         drawText(this.validator.translate(obj.position), obj.text);
//       }
//
//       switch (obj.type) {
//         case ROType.STREAK:
//           drawMark(obj.position);
//           break;
//         case ROType.DOT:
//         case ROType.BOX:
//         case ROType.LEFT_ARROW:
//         case ROType.RIGHT_ARROW:
//           throw `Unsupported ${obj.type}${obj.position}`;
//       }
//     }
//   }
// }
