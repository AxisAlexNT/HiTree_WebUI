import { point } from "@/app/ui/components/tracks_deprecated/ruler/genome-line";
import { GenomeLineDrawer } from "@/app/ui/components/tracks_deprecated/ruler/GenomeLineDrawer";

function regularLine(): GenomeLineDrawer {
  return new GenomeLineDrawer(new point(0, 0), 100, true, 10, (shift) => shift);
}

function imbalancedLine(): GenomeLineDrawer {
  return new GenomeLineDrawer(new point(0, 0), 100, false, 10, (shift) =>
    0.005 * shift ** 2
  );
}

function asd(): void {
  alert("asd");
}

export { regularLine, imbalancedLine, asd };
