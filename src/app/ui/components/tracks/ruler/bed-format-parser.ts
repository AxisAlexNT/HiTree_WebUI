export const FiLE_CONTENT = `
  chr1         0  40000000 Pos1 0 +
  chr1  50000000  90000000 Pos2 0 -
  chr1 100000000 120000000 Pos3 0 -
  chr1 200000000 210000000 Pos4 0 +
  chr2 158364697 158365864 Pos1 0 +
  chr2 158365864 158367031 Pos2 0 +
  chr3 127477031 127478198 Pos1 0 +
  chr3 127478198 127479365 Pos2 0 +
  chr3 127479365 127480532 Pos3 0 +
  chr3 127480532 127481699 Pos4 0 +`;

export class BedFormatParser {
  private readonly content: string;
  private readonly chromosome: string;
  private fieldCount = -1;

  constructor(content: string, chromosome: string) {
    this.content = content;
    this.chromosome = chromosome;
  }

  public parse(): TracksHolder {
    let holder: TracksHolder | undefined = undefined;

    for (const line of this.content.split(/\n/)) {
      const items = line.trim().split(/\s+/);

      if (items[0] !== this.chromosome) {
        continue;
      }

      const track: Track = {
        chromosome: items[0],
        start: +items[1],
        end: +items[2],
      };

      let index = 3;
      for (const item of items.slice(index)) {
        track[TRACK_NAMES[index++]] = item;
      }

      if (index < 3) {
        throw "Invalid .bed format";
      }

      if (this.fieldCount === -1) {
        this.fieldCount = index;
      }

      if (!holder) {
        holder = new TracksHolder(this.fieldCount);
      }

      holder.tracks.push(track);
    }

    if (!holder) {
      throw "Invalid empty .bed-file!";
    }

    return holder;
  }
}

export class TracksHolder {
  public readonly tracks: Array<Track> = [];
  public readonly fieldCount: number;

  constructor(fieldCount: number) {
    this.fieldCount = fieldCount;
  }
}

const TRACK_NAMES = [
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

export interface Track {
  chromosome: string;
  start: number;
  end: number;
  [key: string]: unknown;
}
