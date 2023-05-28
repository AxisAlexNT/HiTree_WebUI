// noinspection JSUnusedGlobalSymbols

export class point {
  constructor(public readonly x: number, public readonly y: number) {}

  public add(other: point): point {
    return new point(this.x + other.x, this.y + other.y);
  }

  public sub(other: point): point {
    return new point(this.x - other.x, this.y - other.y);
  }

  public isBetween(left: point, right: point): boolean {
    const diffSign = (l: number, r: number, c: number) =>
      (l >= c && c >= r) || (l <= c && c <= r);

    return (
      diffSign(left.x, right.x, this.x) && diffSign(left.y, right.y, this.y)
    );
  }

  public length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  public toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}

export class Streak {
  public constructor(
    public readonly position: point,
    public readonly weight: number = 10
  ) {}
}

export class GenomeLine {
  public readonly streaks: Streak[] = [];

  public constructor(
    public readonly start: point,
    public readonly length: number,
    public readonly horizontal: boolean,
    private skip: number,
    private skipConversion: (shift: number) => number
  ) {}

  public reload(): void {
    let curPos = this.start;

    let shift = 0;

    while (curPos.sub(this.start).length() < this.length) {
      const now =
        this.skipConversion(this.horizontal ? curPos.x : curPos.y) - shift + 1;
      curPos = curPos.add(
        new point(this.horizontal ? 1 : 0, this.horizontal ? 0 : 1)
      );

      if (now >= this.skip) {
        shift += this.skip;
        this.streaks.push(new Streak(curPos));
      }
    }
  }
}
