import { Map, View } from "ol";
import { ZoomSlider, ScaleLine, OverviewMap } from "ol/control";
import { DoubleClickZoom, DragPan } from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import ContigDimensionHolder from "./ContigDimensionHolder";
import { ScaffoldHolder } from "./ScaffoldHolder";
import { HiCViewAndLayersManager } from "./HiCViewAndLayersManager";
import OSM from "ol/source/OSM";
import type { OpenFileResponse } from "../net/netcommon";
import type { NetworkManager } from "../net/NetworkManager";
import type { ContigDescriptor } from "../domain/ContigDescriptor";
import { CommonEventManager } from "./CommonEventManager";
import { CurrentSignalRangeResponse } from "../net/api/response";
import { VisualizationManager } from "./VisualizationManager";
import { Ref } from "vue";

class ContactMapManager {
  public readonly map: Map;
  public readonly contigDimensionHolder: ContigDimensionHolder;
  public readonly scaffoldHolder: ScaffoldHolder;
  public readonly viewAndLayersManager: HiCViewAndLayersManager;
  public readonly networkManager: NetworkManager;
  public readonly eventManager: CommonEventManager;
  public sizeObserver?: ResizeObserver;
  public readonly toastHandlers: (() => void)[] = [];
  public readonly visualizationManager: VisualizationManager;
  public minimap: OverviewMap | null;

  constructor(
    protected readonly options: {
      readonly response: OpenFileResponse;
      readonly filename: string;
      readonly fastaFilename: string;
      readonly tileSize: number;
      readonly contigBorderColor: string;
      readonly mapTargetSelector: string;
      readonly networkManager: NetworkManager;
      readonly minimapTarget: Ref<HTMLElement | null>;
    }
  ) {
    const contigDescriptors: ContigDescriptor[] =
      options.response.assemblyInfo.contigDescriptors;
    this.contigDimensionHolder = new ContigDimensionHolder(contigDescriptors);
    this.scaffoldHolder = new ScaffoldHolder(
      this.contigDimensionHolder,
      options.response.assemblyInfo.scaffoldDescriptors
    );

    this.eventManager = new CommonEventManager(this);

    this.networkManager = options.networkManager;

    this.viewAndLayersManager = new HiCViewAndLayersManager(
      this,
      options.response
    );

    this.visualizationManager = new VisualizationManager(this);
    this.visualizationManager.fetchVisualizationOptions();

    this.map = new Map({
      layers: [],
      interactions: [],
    });

    this.minimap = null;
  }

  public initializeMap(): void {
    this.map.setTarget(this.options.mapTargetSelector);
    this.sizeObserver = new ResizeObserver(() => {
      this.map.updateSize();
    });
    this.sizeObserver.observe(
      document.querySelector("#" + this.options.mapTargetSelector) as Element
    );
    this.map.setView(this.viewAndLayersManager.getView());
    this.viewAndLayersManager.initializeMapsDataLayers();
    this.viewAndLayersManager.initializeTracks();
    this.initializeMapInteractions();
    this.initializeMapControls();
    console.log("Map initialized. Contact map manager: ", this);
  }

  public initializeMapInteractions(): void {
    this.map.addInteraction(new DoubleClickZoom());
    this.map.addInteraction(new DragPan());
    this.viewAndLayersManager.initializeMapInteractions();
  }

  public initializeMapControls(): void {
    // Add some more controls:
    this.map.addControl(new ZoomSlider());
    // this.map.addInteraction(
    //   new SplitRulesInteraction({
    //     mapManager: this,
    //     selectionCallback: this.eventManager.onClickInScissorsMode,
    //   })
    // );
    /*
    // No more scale line in kilometers:
    this.map.addControl(
      new ScaleLine({
        bar: true,
        text: true,
      })
    );
    */
    this.viewAndLayersManager.initializeMapControls();
  }

  public addOverviewMapTarget(target: HTMLElement | string) {
    this.map.addControl(
      new OverviewMap({
        collapsed: false,
        target: target,
        layers: this.viewAndLayersManager.layersHolder.hicDataLayers,
        collapsible: false,
      })
    );
  }

  public getOptions() {
    return this.options;
  }

  public getMap(): Map {
    return this.map;
  }

  public getMiniMap(): OverviewMap {
    return this.minimap;
  }

  public getView(): View {
    return this.viewAndLayersManager.getView();
  }

  public getLayersManager(): HiCViewAndLayersManager {
    return this.viewAndLayersManager;
  }

  public getContigDimensionHolder(): ContigDimensionHolder {
    return this.contigDimensionHolder;
  }

  public setMapTarget(target?: string | HTMLElement): void {
    this.map.setTarget(target);
  }

  public reloadTiles(): void {
    this.viewAndLayersManager.reloadTiles();
  }

  public dispose() {
    this.map.setTarget(undefined);
  }

  public addOSM() {
    this.map.addLayer(
      new TileLayer({
        source: new OSM(),
      })
    );
  }

  public addContrastSliderCallback(
    callbackfn: (ranges: CurrentSignalRangeResponse) => void
  ): void {
    this.viewAndLayersManager.addContrastSliderCallback(callbackfn);
  }

  public deactivateTranslocation(): void {
    // Deactivate selection:
    this.viewAndLayersManager.currentViewState.activeTool = undefined;
    this.viewAndLayersManager.selectionInteractions.translocationArrowHoverInteraction.setActive(
      false
    );
    this.viewAndLayersManager.selectionInteractions.translocationArrowSelectionInteraction.setActive(
      false
    );
    this.viewAndLayersManager.selectionInteractions.contigSelectionInteraction.setActive(
      true
    );
    this.viewAndLayersManager.selectionInteractions.contigSelectExtent.setActive(
      true
    );
    this.viewAndLayersManager.selectionInteractions.translocationArrowSelectionInteraction.unset(
      "startContigId"
    );
    this.viewAndLayersManager.selectionInteractions.translocationArrowSelectionInteraction.unset(
      "endContigId"
    );
  }

  public deactivateScissors(): void {
    // Deactivate selection:
    this.viewAndLayersManager.currentViewState.activeTool = undefined;
    this.viewAndLayersManager.deferredInitializationInteractions.scissorsGuideInteraction?.setActive(
      false
    );
    this.viewAndLayersManager.selectionInteractions.contigSelectionInteraction.setActive(
      true
    );
    this.viewAndLayersManager.selectionInteractions.contigSelectExtent.setActive(
      true
    );
  }

  public reloadVisuals(): void {
    this.viewAndLayersManager.reloadVisuals();
  }
}

export { ContactMapManager /*, type ContactMapManagerOptions*/ };
