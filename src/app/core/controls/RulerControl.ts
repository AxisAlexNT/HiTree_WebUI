import { MapEvent } from "ol";
import { Control } from "ol/control";
import { Options as ControlOptions } from "ol/control/Control";
import { ContactMapManager } from "../mapmanagers/ContactMapManager";
import {
  HiCViewAndLayersManager,
  LayerResolutionDescriptor,
} from "../mapmanagers/HiCViewAndLayersManager";
import ContigDimensionHolder from "../mapmanagers/ContigDimensionHolder";
import { transform, transformExtent } from "ol/proj";
import { toSI } from "display-si";

interface Options extends ControlOptions {
  position: "top" | "bottom" | "left" | "right";
  direction: "vertical" | "horizontal";
  mapManager: ContactMapManager;
}

class RulerControl extends Control {
  protected readonly canvas: HTMLCanvasElement;
  protected readonly mapManager: ContactMapManager;
  protected readonly viewAndLayersManager: HiCViewAndLayersManager;
  protected readonly contigDimensionHolder: ContigDimensionHolder;

  public constructor(public readonly opt_options: Options) {
    const canvas = document.createElement("canvas");
    const newOptions = {
      ...opt_options,
      ...{
        element: canvas,
      },
    };
    super(newOptions);
    this.canvas = canvas;
    this.mapManager = opt_options.mapManager;
    this.viewAndLayersManager = this.mapManager.getLayersManager();
    this.contigDimensionHolder = this.mapManager.getContigDimensionHolder();
    console.log("RulerControl constructor finished", this);
  }

  render(mapEvent: MapEvent) {
    const map = mapEvent.map;
    const size = map.getSize() as [number, number];
    this.canvas.width = size[0];
    this.canvas.height = 200; //size[1];
    const context = this.canvas.getContext("2d");
    console.log("Got context: ", context, "RulerControl: ", this);
    if (!context) return;
    console.log("Context available");

    context.clearRect(0, 0, size[0], size[1]);

    const mapView = map.getView();

    const resolutionDescriptor =
      this.viewAndLayersManager.currentViewState.resolutionDesciptor;

    const activeHiCLayer = this.viewAndLayersManager.getActiveHiCDataLayer();
    const extent = mapView.calculateExtent(map.getSize());
    const mapProjection = mapView.getProjection();

    const targetProjection = activeHiCLayer.getSource()?.getProjection();

    if (!targetProjection) {
      console.log(
        "Active Hi-C layer",
        activeHiCLayer,
        "does not have a target projection set"
      );
      return;
    }

    const ps = this.contigDimensionHolder.prefix_sum_px.get(
      resolutionDescriptor.bpResolution
    );
    if (!ps) {
      console.log(
        "No prefix sum for current bpResolution??",
        resolutionDescriptor
      );
      return;
    }
    const pixelMapSize = ps[ps.length - 1];

    const extentInTargetProjection = transformExtent(
      extent,
      mapProjection,
      targetProjection
    );

    const fraction1 =
      (mapView.getResolution() ?? 0) /
      resolutionDescriptor.layerResolutionBorders.minResolutionInclusive;

    const fraction2 =
      1 +
      ((mapView.getResolution() ?? 0) -
        resolutionDescriptor.layerResolutionBorders.minResolutionInclusive) /
        (resolutionDescriptor.layerResolutionBorders.maxResolutionExclusive -
          resolutionDescriptor.layerResolutionBorders.minResolutionInclusive);

    const fraction3 =
      (resolutionDescriptor.layerResolutionBorders.maxResolutionExclusive -
        resolutionDescriptor.layerResolutionBorders.minResolutionInclusive) /
      ((mapView.getResolution() ?? 0) -
        resolutionDescriptor.layerResolutionBorders.minResolutionInclusive);

    const fraction4 =
      resolutionDescriptor.layerResolutionBorders.maxResolutionExclusive /
      (mapView.getResolution() ?? 1);
    // const pixelResolution = activeHiCLayer.get("pixelResolution");
    const pixelResolution = mapView.getResolution() ?? 1;
    // const pixelResolution = (mapView.getResolution() / fraction3) ?? 1;

    const fixed_coordinates = transform(
      extent,
      map.getView().getProjection(),
      targetProjection
    ).map((c) => c / pixelResolution);

    const leftmostMapPx = -fixed_coordinates[0];
    const rightmostMapPx = fixed_coordinates[2];
    const topmostMapPx = fixed_coordinates[3];
    const bottommostMapPx = -fixed_coordinates[1];
    const rightLength = rightmostMapPx - leftmostMapPx;

    const mapBoxPixelCoordinates = {
      left: Math.round(leftmostMapPx),
      right: Math.round(rightmostMapPx),
      top: Math.round(topmostMapPx),
      bottom: Math.round(bottommostMapPx),
      rightLength: Math.round(rightLength),
    };

    const visibleMapBoxExtentPixel = {
      left: Math.round(Math.max(0, leftmostMapPx)),
      right: Math.round(
        Math.min(
          mapBoxPixelCoordinates.left + pixelMapSize / fraction1,
          size[0]
        )
      ),
      top: Math.round(Math.max(0, topmostMapPx)),
      bottom: Math.round(size[1] - Math.min(bottommostMapPx, size[1])),
    };

    console.log(
      //   "Got extent",
      //   extent,
      "transformed into",
      extentInTargetProjection.map(Math.round),
      "fixedCoordinates",
      fixed_coordinates.map(Math.round),
      "mapBoxPixelCoordinates",
      mapBoxPixelCoordinates,
      "visibleMapBoxExtentPixel",
      visibleMapBoxExtentPixel,
      "mapViewResolution",
      mapView.getResolution(),
      "layerResolution",
      activeHiCLayer.get("pixelResolution"),
      "mapViewZoom",
      mapView.getZoom(),
      "resolutionBorders",
      resolutionDescriptor.layerResolutionBorders,
      "fraction1",
      fraction1,
      "fraction2",
      fraction2,
      "fraction3",
      fraction3,
      "fraction4",
      fraction4
    );

    const startX = visibleMapBoxExtentPixel.left;
    const endX = visibleMapBoxExtentPixel.right;
    const y0 = Math.round(this.canvas.height / 2);
    context.beginPath();
    context.moveTo(startX, y0 - 5);
    context.lineTo(endX, y0 - 5);
    context.moveTo(startX, y0 + 5);
    context.lineTo(endX, y0 + 5);
    context.strokeStyle = "black";
    context.stroke();

    const tickInterval = 100;
    for (let x = startX; x < endX - 50; x += tickInterval) {
      this.drawTickAtPxOffset(
        context,
        resolutionDescriptor,
        x,
        startX,
        endX,
        y0,
        tickInterval
      );
    }
    this.drawTickAtPxOffset(
      context,
      resolutionDescriptor,
      endX,
      startX,
      endX,
      y0,
      tickInterval
    );
  }

  protected drawTickAtPxOffset(
    context: CanvasRenderingContext2D,
    resolutionDescriptor: LayerResolutionDescriptor,
    px: number,
    startPx: number,
    endPx: number,
    y0: number,
    tickInterval: number
  ): void {
    px = Math.round(px);

    const dPx = Math.round(px - startPx);

    const [preBP, postBP] = (() => {
      if (dPx == 0) {
        return [
          0,
          this.contigDimensionHolder.getStartBpOfPx(
            0,
            resolutionDescriptor.bpResolution
          ),
        ];
      } else if (px == endPx) {
        return [
          this.contigDimensionHolder.getStartBpOfPx(
            dPx - 1,
            resolutionDescriptor.bpResolution
          ),

          this.contigDimensionHolder.getStartBpOfPx(
            dPx + 100,
            resolutionDescriptor.bpResolution
          ),
        ];
      } else {
        return [
          this.contigDimensionHolder.getStartBpOfPx(
            dPx,
            resolutionDescriptor.bpResolution
          ),

          this.contigDimensionHolder.getStartBpOfPx(
            dPx,
            resolutionDescriptor.bpResolution
          ),
        ];
      }
    })();

    context.beginPath();
    context.moveTo(px, y0 - 10);
    context.lineTo(px, y0 + 10);
    context.stroke();

    const angleDeg = -45;

    if (postBP - preBP > resolutionDescriptor.bpResolution) {
      const SIStringPre = toSI(preBP); // + "bp";
      const SIStringPost = toSI(postBP); // + "bp";
      const mtPre = context.measureText(SIStringPre);
      //   const mtPost = context.measureText(SIStringPost);
      //   context.fillText(SIStringPre, Math.round(px - mtPre.width - 10), y0 - 10 - 20);
      this.drawRotatedText(
        SIStringPre,
        Math.round(px - 20),
        y0 - 10 - 5,
        context,
        angleDeg,
        "20px serif"
      );
      //   context.fillText(SIStringPost, Math.round(px + 10), y0 - 10 - 20);
      this.drawRotatedText(
        SIStringPost,
        Math.round(px + 20),
        y0 - 10 - 5,
        context,
        angleDeg,
        "20px serif"
      );
    } else {
      const SIString = toSI(preBP); // + "bp";
      const mt = context.measureText(SIString);
      //   context.fillText(SIString, Math.round(px - mt.width / 2), y0 - 10 - 20);
      this.drawRotatedText(
        SIString,
        Math.round(px),
        y0 - 10 - 5,
        context,
        angleDeg,
        "20px serif"
      );
    }

    context.restore();
  }

  protected drawRotatedText(
    text: string,
    x: number,
    y: number,
    context: CanvasRenderingContext2D,
    angleDeg: number,
    font: string
  ): void {
    context.save();
    context.translate(x, y);
    context.rotate(angleDeg * (Math.PI / 180));
    context.font = font;
    context.textAlign = "left";
    context.fillText(text, 0, 0);
    context.restore();
  }
}

export { RulerControl, type Options };
