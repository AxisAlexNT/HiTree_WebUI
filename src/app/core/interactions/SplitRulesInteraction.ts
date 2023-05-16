import PointerInteraction from "ol/interaction/Pointer";
import { type Options as PIOpts } from "ol/interaction/Pointer";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { ContactMapManager } from "../mapmanagers/ContactMapManager";
import { Feature, MapBrowserEvent } from "ol";
import { Pixel } from "ol/pixel";
import { LineString } from "ol/geom";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import { Coordinate } from "ol/coordinate";
import MapBrowserEventType from "ol/MapBrowserEventType";
import CommonUtils from "@/CommonUtils";

interface Options extends PIOpts {
  mapManager: ContactMapManager;
  wrapX?: boolean;
  selectionCallback: (coordinate_px: Coordinate, bp_resolution: number) => void;
  zIndex: number;
  style?: Style;
}

class SplitRulesInteraction extends PointerInteraction {
  private readonly ruleOverlayLayer: VectorLayer<VectorSource>;
  private readonly mapManager: ContactMapManager;

  private ruleFeatures: [
    Feature<LineString> | undefined,
    Feature<LineString> | undefined
  ];

  protected readonly ruleStyle: Style = new Style({
    stroke: new Stroke({
      color: [255, 130, 30, 0.75],
      width: 2,
      lineDash: [2, 2],
    }),
  });

  protected readonly options: Options;

  constructor(options: Options) {
    options = options || {};
    super(options);
    this.options = options;
    this.mapManager = options.mapManager;
    this.ruleOverlayLayer = new VectorLayer({
      map: this.mapManager.getMap(),
      zIndex: options.zIndex,
      source: new VectorSource({
        useSpatialIndex: false,
        wrapX: options.wrapX ?? false,
      }),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
    });
    this.ruleFeatures = [undefined, undefined];
  }

  protected handlePointerMove(mapBrowserEvent: MapBrowserEvent<UIEvent>): void {
    const pixel = mapBrowserEvent.pixel;

    this.createOrUpdateRules(pixel);
  }

  protected createOrUpdateRules(pixel: Pixel): void {
    /*
     * pixel[0] is X in map window coordinates (grows from the left to the right)
     * pixel[1] is Y in map window coordinates (grows from the top to the bottom)
     */
    const coordinate = this.getMap()?.getCoordinateFromPixelInternal(pixel) ?? [
      0, 0,
    ];
    // console.log("SplitRulesInteraction: createOrUpdateRules pixel=", pixel);
    let [verticalRuleFeature, horizontalRuleFeature] = this.ruleFeatures;

    const bpResolution =
      this.mapManager.viewAndLayersManager.currentViewState.resolutionDesciptor
        .bpResolution;
    const pixelResolution =
      this.mapManager.viewAndLayersManager.currentViewState.resolutionDesciptor
        .pixelResolution;
    const contigCount = this.mapManager.contigDimensionHolder.contig_count;
    const prefixSumPx =
      this.mapManager.contigDimensionHolder.prefix_sum_px.get(bpResolution);
    const mapSizePx = prefixSumPx ? prefixSumPx[contigCount] : 1000;
    const mapSizeProj = mapSizePx * pixelResolution;

    const fixedCoordinate = coordinate.map((x) =>
      CommonUtils.clamp(x, 0, mapSizePx * pixelResolution)
    );

    const verticalRuleCoordinates = [
      [fixedCoordinate[0], 0],
      [fixedCoordinate[0], -mapSizeProj],
    ];

    const x = fixedCoordinate[0];

    const horizontalRuleCoordinates =
      x > mapSizeProj / 2
        ? [
            [mapSizeProj, -(2 * x - mapSizeProj)],
            [2 * x - mapSizeProj, -mapSizeProj],
          ]
        : [
            [2 * x, 0],
            [0, -2 * x],
          ];

    if (!verticalRuleFeature) {
      verticalRuleFeature = new Feature(
        new LineString(verticalRuleCoordinates)
      );
      verticalRuleFeature.setStyle(this.options.style ?? this.ruleStyle);
      this.ruleFeatures[0] = verticalRuleFeature;
      this.ruleOverlayLayer.getSource()?.addFeature(verticalRuleFeature);
    } else {
      const geometry = verticalRuleFeature.getGeometry();
      if (geometry) {
        geometry.setCoordinates(verticalRuleCoordinates);
      }
    }

    if (!horizontalRuleFeature) {
      horizontalRuleFeature = new Feature(
        new LineString(horizontalRuleCoordinates)
      );
      horizontalRuleFeature.setStyle(this.options.style ?? this.ruleStyle);
      this.ruleFeatures[1] = horizontalRuleFeature;
      this.ruleOverlayLayer.getSource()?.addFeature(horizontalRuleFeature);
    } else {
      const geometry = horizontalRuleFeature.getGeometry();
      if (geometry) {
        geometry.setCoordinates(horizontalRuleCoordinates);
      }
    }
  }

  public handleEvent(mapBrowserEvent: MapBrowserEvent<UIEvent>): boolean {
    switch (mapBrowserEvent.type) {
      case MapBrowserEventType.DBLCLICK:
        {
          const coordinate = this.getMap()?.getCoordinateFromPixelInternal(
            mapBrowserEvent.pixel
          ) ?? [0, 0];
          const bpResolution =
            this.mapManager.viewAndLayersManager.currentViewState
              .resolutionDesciptor.bpResolution;
          const contigCount =
            this.mapManager.contigDimensionHolder.contig_count;
          const prefixSumPx =
            this.mapManager.contigDimensionHolder.prefix_sum_px.get(
              bpResolution
            );
          const mapSizePx = prefixSumPx ? prefixSumPx[contigCount] : 1000;
          mapBrowserEvent.preventDefault();
          this.options.selectionCallback(
            coordinate.map((c) =>
              CommonUtils.clamp(c >= 0 ? c : -c, 0, mapSizePx)
            ),
            this.mapManager.viewAndLayersManager.currentViewState
              .resolutionDesciptor.bpResolution
          );
          return false;
        }
        break;
      case MapBrowserEventType.POINTERMOVE:
        this.handlePointerMove(mapBrowserEvent);
        return false;
        break;
      default:
        return true;
    }
  }
}

export { SplitRulesInteraction, Options };
