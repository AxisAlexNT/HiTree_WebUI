// noinspection JSUnusedGlobalSymbols

import { Interval } from "@/app/core/roulette/tuple";

const FILED_NAMES = [
  "chromosome",
  "start",
  "end",
  "name",
  "score",
  "strand",
  "thickStart",
  "thickEnd",
  "itemRgb",
  "blockCount",
  "blockSize",
  "blockStarts",
];

export interface ChromosomeDescription {
  readonly chromosome: string;
  readonly start: number;
  readonly end: number;
  [key: string]: unknown;
}

export class Chromosome {
  readonly description: Array<ChromosomeDescription> = [];
  readonly name: string;
  private size: number;

  constructor(...description: ChromosomeDescription[]) {
    this.description.push(...description);
    this.name = description[0].chromosome;
    // eslint-disable-next-line
    this.size = description.reduce((total, cur) => total + (cur.end - cur.start), 0);
  }

  public push(desc: ChromosomeDescription): void {
    this.description.push(desc);
    this.size += desc.end - desc.start;
  }

  public length(): number {
    return this.size;
  }
}

export class TrackManager {
  public readonly filename: string;
  public readonly genome: Array<Chromosome> = [];
  public readonly fieldCount: number;
  private score: Interval;

  constructor(filename: string, fieldCount: number) {
    this.filename = filename;
    this.fieldCount = fieldCount;
    this.score = new Interval(0, -1);
  }

  public getScore(): Interval {
    if (this.fieldCount < 5) {
      throw "This bed-file contains no information about number of fields";
    }

    return this.score;
  }

  public push(chromo: Chromosome): void {
    this.genome.push(chromo);

    if (this.fieldCount < 5) {
      return;
    }

    // eslint-disable-next-line
    const minScore = Math.min(this.score.x, ...chromo.description.map((d) => (d.score ? +d.score : 100)));
    // eslint-disable-next-line
    const maxScore = Math.max(this.score.y, ...chromo.description.map((d) => (d.score ? +d.score : -1)));

    this.score = new Interval(minScore, maxScore);
  }

  public appendDescription(
    chromo: string,
    description: ChromosomeDescription
  ): void {
    const cur = this.genome.filter((c) => c.name == chromo);
    if (cur.length == 0) {
      this.genome.push(new Chromosome(description));
    } else {
      // There will be always exactly one chromosome for given name
      cur[0].push(description);
    }
  }

  public getAbsolutePosition(chromo: string): number {
    let pos = 0;

    for (const chr of this.genome) {
      if (chr.name == chromo) {
        return pos;
      }

      pos += chr.length();
    }

    throw `No chromosome with such name "${chromo}" was found`;
  }
}

export class BedParser {
  public parse(filename: string, content: string[]): TrackManager {
    let manager: TrackManager | undefined = undefined;
    let fieldCount = -1;

    const invalid = (): never => {
      throw "Invalid format of `.bed`-file";
    };

    // eslint-disable-next-line
    for (const line of content) {
      const items = line.trim().split(/\s+/);

      const description: ChromosomeDescription = {
        chromosome: items[0] ?? invalid(),
        start: +items[1] ?? invalid(),
        end: +items[2] ?? invalid(),
      };

      const name = items[0];

      let index = 3;
      for (const item of items.slice(index)) {
        description[FILED_NAMES[index++]] = item;
      }

      if (fieldCount === -1) {
        fieldCount = index;
      }

      if (!manager) {
        manager = new TrackManager(filename, fieldCount);
      }

      manager.appendDescription(name, description);
    }

    if (!manager) {
      throw "Invalid empty .bed-file!";
    }

    return manager;
  }
}
