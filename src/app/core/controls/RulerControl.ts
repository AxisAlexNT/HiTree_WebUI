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
import { storeToRefs } from "pinia";
import { useStyleStore } from "@/app/stores/styleStore";
import { useVisualizationOptionsStore } from "@/app/stores/visualizationOptionsStore";
import { Ref } from "vue";
import Colormap from "../visualization/colormap/Colormap";
import { ColorTranslator } from "colortranslator";
import SimpleLinearGradient from "../visualization/colormap/SimpleLinearGradient";

interface Options extends ControlOptions {
  // position: "top" | "bottom" | "left" | "right";
  direction: "vertical" | "horizontal";
  mapManager: ContactMapManager;
}

class RulerControl extends Control {
  protected readonly canvas: HTMLCanvasElement;
  protected readonly mapManager: ContactMapManager;
  protected readonly viewAndLayersManager: HiCViewAndLayersManager;
  protected readonly contigDimensionHolder: ContigDimensionHolder;

  protected readonly mapBackgroundColor: Ref<ColorTranslator>;
  protected readonly colormap: Ref<Colormap>;

  public readonly canvasSize: number[];

  public constructor(public readonly opt_options: Options) {
    const canvas = document.createElement("canvas");
    let canvasSize: number[];

    if (opt_options.target) {
      const parent =
        typeof opt_options.target === "string" ||
        opt_options.target instanceof String
          ? document.getElementById(opt_options.target as string)
          : (opt_options.target as HTMLElement);
      if (parent) {
        parent?.appendChild(canvas);
      } else {
        throw new Error(
          "Cannot find parent element for RulerControl with target " +
            opt_options.target
        );
      }
      const dim = parent.getBoundingClientRect();
      canvasSize = [Math.floor(dim.width), Math.floor(dim.height)];
    } else {
      const mapSize = opt_options.mapManager.getMap().getSize() as [
        number,
        number
      ];
      canvasSize = [mapSize[0], 200];
    }
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

    const visualizationOptionsStore = useVisualizationOptionsStore();
    const { colormap } = storeToRefs(visualizationOptionsStore);
    const stylesStore = useStyleStore();
    const { mapBackgroundColor } = storeToRefs(stylesStore);

    this.colormap = colormap;
    this.mapBackgroundColor = mapBackgroundColor as Ref<ColorTranslator>;

    this.canvasSize = canvasSize;

    console.log("RulerControl constructor finished", this);
  }

  render(mapEvent: MapEvent) {
    const map = mapEvent.map;
    const size = this.canvasSize; //map.getSize() as [number, number];
    this.canvas.width = size[0];
    this.canvas.height = size[1];
    const context = this.canvas.getContext("2d");
    console.log("Got context: ", context, "RulerControl: ", this);
    if (!context) return;
    console.log("Context available");

    context.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
    // context.save();
    // this.setFillStrokeContrastColors(context);
    // const strokeStyle = context.strokeStyle;
    context.strokeStyle = context.fillStyle;
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(startX, y0 - 5);
    context.lineTo(endX, y0 - 5);
    context.moveTo(startX, y0 + 5);
    context.lineTo(endX, y0 + 5);
    context.strokeStyle = "white";
    context.stroke();
    // context.strokeStyle = strokeStyle;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(startX, y0 - 5);
    context.lineTo(endX, y0 - 5);
    context.moveTo(startX, y0 + 5);
    context.lineTo(endX, y0 + 5);
    context.strokeStyle = "black";
    context.stroke();
    // context.reset();

    const tickInterval = 100;
    for (let x = startX; x < endX - 50; x += tickInterval) {
      this.drawTickAtPxOffset(
        context,
        resolutionDescriptor,
        x,
        startX,
        endX,
        y0,
        tickInterval,
        mapBoxPixelCoordinates,
        visibleMapBoxExtentPixel,
        fraction1
      );
    }
    this.drawTickAtPxOffset(
      context,
      resolutionDescriptor,
      endX,
      startX,
      endX,
      y0,
      tickInterval,
      mapBoxPixelCoordinates,
      visibleMapBoxExtentPixel,
      fraction1
    );
  }

  protected drawTickAtPxOffset(
    context: CanvasRenderingContext2D,
    resolutionDescriptor: LayerResolutionDescriptor,
    px: number,
    startPx: number,
    endPx: number,
    y0: number,
    tickInterval: number,
    mapBoxPixelCoordinates: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    },
    visibleMapBoxExtentPixel: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    },
    fraction1: number
  ): void {
    px = Math.round(px);

    const dPx =
      Math.round(px - startPx - Math.min(0, mapBoxPixelCoordinates.left)) *
      fraction1;

    const dBp =
      dPx == 0
        ? 0
        : this.contigDimensionHolder.getStartBpOfPx(
            dPx,
            resolutionDescriptor.bpResolution
          ) -
          this.contigDimensionHolder.getStartBpOfPx(
            Math.max(
              0,
              Math.round(-Math.min(0, mapBoxPixelCoordinates.left)) * fraction1
            ),
            resolutionDescriptor.bpResolution
          );

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

    context.strokeStyle = "white";
    context.lineWidth = 6;
    context.beginPath();
    context.moveTo(px, y0 - 20);
    context.lineTo(px, y0 + 20);
    context.stroke();
    context.strokeStyle = "black";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(px, y0 - 20);
    context.lineTo(px, y0 + 20);
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
        y0 - 20 - 5,
        context,
        angleDeg,
        "bold 20px serif"
      );
      //   context.fillText(SIStringPost, Math.round(px + 10), y0 - 10 - 20);
      this.drawRotatedText(
        SIStringPost,
        Math.round(px + 20),
        y0 - 20 - 5,
        context,
        angleDeg,
        "bold 20px serif"
      );
    } else {
      const SIString = toSI(preBP); // + "bp";
      const mt = context.measureText(SIString);
      //   context.fillText(SIString, Math.round(px - mt.width / 2), y0 - 10 - 20);
      this.drawRotatedText(
        SIString,
        Math.round(px),
        y0 - 20 - 5,
        context,
        angleDeg,
        "bold 20px serif"
      );
    }

    this.drawRotatedText(
      "+" + toSI(dBp) + "bp",
      Math.round(px),
      y0 + 20 + 5 + 20,
      context,
      0,
      "bold 20px serif"
    );

    context.restore();
  }

  protected drawRotatedText(
    text: string,
    x: number,
    y: number,
    context: CanvasRenderingContext2D,
    angleDeg: number,
    font: string,
    stroke?: boolean
  ): void {
    context.save();
    context.translate(x, y);
    context.rotate(angleDeg * (Math.PI / 180));
    context.font = font;
    context.textAlign = "left";

    const mt = context.measureText(text);

    const backgroundColor = this.mapBackgroundColor.value;

    context.fillStyle = backgroundColor.RGB;

    context.fillRect(-5, 5, mt.width + 5 + 5, -(mt.fontBoundingBoxAscent + 5));

    this.setFillStrokeContrastColors(context);

    context.fillText(text, 0, 0);
    if (stroke) {
      context.strokeText(text, 0, 0);
    }

    context.restore();
  }

  protected setFillStrokeContrastColors(
    context: CanvasRenderingContext2D
  ): void {
    const backgroundColor = this.mapBackgroundColor.value;

    const fillColor = new ColorTranslator(
      {
        H: (180 + backgroundColor.H) % 360.0,
        S: backgroundColor.S, // > 50 ? 30 : 70,
        L: backgroundColor.L > 50 ? 30 : 70,
        A: 1.0,
      },
      { legacyCSS: true }
    ).RGB;
    context.fillStyle = fillColor;

    const cmap = this.colormap.value;

    if (!(cmap instanceof SimpleLinearGradient)) {
      context.fillStyle = "black";
    } else {
      const cmapEndColor = cmap.endColorRGBA;
      const strokeColor = new ColorTranslator(
        {
          H: (180 + cmapEndColor.H) % 360.0,
          S: cmapEndColor.S, // > 50 ? 30 : 70,
          L: cmapEndColor.L > 50 ? 30 : 70,
          A: 1.0,
        },
        { legacyCSS: true }
      ).RGB;
      context.strokeStyle = strokeColor;
    }
  }
}

export { RulerControl, type Options };
