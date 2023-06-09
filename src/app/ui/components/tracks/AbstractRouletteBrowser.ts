import { ContigDirection } from "@/app/core/domain/common";
import { Roulette, RouletteConfig, RouletteOrientation, Contig, RouletteLayer } from "@/app/core/roulette/Roulette";
import P5 from "p5";
import { BedParser, TrackManager } from "@/app/core/roulette/BedParser";
import { ContactMapManager } from "@/app/core/mapmanagers/ContactMapManager";
import { Interval, Vector } from "@/app/core/roulette/tuple";

export const defaultTrackManager = new BedParser().parse("unknown", ["unknown", "0", "0"]);

export function mappings(mapManager: ContactMapManager | undefined): any {
  const acceptContig = (e: number): Contig => {
    const prefixes =
      mapManager?.contigDimensionHolder.prefix_sum_px.get(
        mapManager?.getLayersManager().currentViewState.resolutionDesciptor
          .bpResolution
      ) ?? [];

    let l = -1;
    let r = prefixes.length;
    while (r - l > 1) {
      const m = Math.round(l + (r - l) / 2);
      if (prefixes[m] < e) {
        l = m;
      } else {
        r = m;
      }
    }

    return {
      interval: new Interval(prefixes[l], prefixes[l + 1]),
      reversed: mapManager?.contigDimensionHolder.contigDescriptors.map(
          (cd) => cd.direction
        )[l] == ContigDirection.REVERSED,
    };
  };

  const pixelToValue = (pixel: number): number | undefined => mapManager?.contigDimensionHolder.getStartBpOfPx(
    pixel,
    mapManager?.viewAndLayersManager.currentViewState.resolutionDesciptor
      .bpResolution
  );

  const valueToPixel = (e: number): number => mapManager?.contigDimensionHolder.getPxContainingBp(
    e,
    mapManager?.viewAndLayersManager.currentViewState.resolutionDesciptor
      .bpResolution
  ) ?? 0;


  return [acceptContig, pixelToValue, valueToPixel];
}

const drawHorizontalText = (p5: P5) => (p: Vector, t: string) => {
  p5.push();

  p5.strokeWeight(0);
  p5.text(t, p.x, p.y - 30);

  p5.pop();
};

const drawVerticalText = (p5: P5) => (p: Vector, t: string) => {
  p5.push();

  p5.translate(p.x, p.y);
  p5.rotate(p5.radians(270));
  p5.text(t, 0, 20);

  p5.pop();
};

export function drawRoulette(layer: RouletteLayer, p5: P5): void {
  const horizontal = layer.isHorizontal();

  p5.background("white");

  p5.textAlign(p5.CENTER);

  p5.textAlign("center", "center");

  layer.draw(
    (s, e) => p5.line(s.x, s.y, e.x, e.y),
    (horizontal ? drawHorizontalText : drawVerticalText)(p5),
    (p) => {
      p5.push();

      p5.strokeWeight(3);
      p5.line(p.x, p.y - 5, p.x, p.y + 5);

      p5.pop();
    },
    (ps, borders) => {
      p5.push();

      if (borders) {
        p5.stroke("#000000");
      }

      p5.beginShape();
      ps.forEach((p) => p5.vertex(p.x, p.y));
      p5.endShape(p5.CLOSE);

      p5.pop();
    },
    (color) => {
      p5.stroke(color);
      p5.fill(color);
    }
  );

  p5.push();

  p5.strokeWeight(3);
  p5.stroke("#00FF00");

  if (horizontal) {
    p5.line(p5.mouseX, layer.baseShift().y - 5, p5.mouseX, layer.baseShift().y + 5);
  } else {
    p5.line(layer.baseShift().x - 5, p5.mouseY, layer.baseShift().x + 5, p5.mouseY);
  }

  p5.pop();
}
