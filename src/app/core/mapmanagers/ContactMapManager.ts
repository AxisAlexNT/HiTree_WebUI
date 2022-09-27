import { Map, View } from "ol";
import { ZoomSlider, ScaleLine } from "ol/control";
import { DoubleClickZoom, DragPan, Select } from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import ContigDimensionHolder from "./ContigDimensionHolder";
import { ScaffoldHolder, type ScaffoldId } from "./ScaffoldHolder";
import { ActiveTool, HiCViewAndLayersManager } from "./HiCViewAndLayersManager";
import OSM from "ol/source/OSM";
import type { OpenFileResponse } from "../net/netcommon";
import type { NetworkManager } from "../net/NetworkManager";
import type { ContigDescriptor } from "../domain/ContigDescriptor";
import {
  GetFastaForSelectionRequest,
  GroupContigsIntoScaffoldRequest,
  MoveSelectionRangeRequest,
  ReverseSelectionRangeRequest,
  UngroupContigsFromScaffoldRequest,
} from "../net/api/request";
import { NormalizationType } from "../domain/common";

class ContactMapManager {
  public readonly map: Map;
  public readonly contigDimensionHolder: ContigDimensionHolder;
  public readonly scaffoldHolder: ScaffoldHolder;
  public readonly viewAndLayersManager: HiCViewAndLayersManager;
  public readonly networkManager: NetworkManager;
  public sizeObserver?: ResizeObserver;

  constructor(
    protected readonly options: {
      readonly response: OpenFileResponse;
      readonly filename: string;
      readonly fastaFilename: string;
      readonly tileSize: number;
      readonly contigBorderColor: string;
      readonly mapTargetSelector: string;
      readonly networkManager: NetworkManager;
    }
  ) {
    const contigDescriptors: ContigDescriptor[] =
      options.response.assemblyInfo.contigDescriptors;
    this.contigDimensionHolder = new ContigDimensionHolder(contigDescriptors);
    this.scaffoldHolder = new ScaffoldHolder(this.contigDimensionHolder);

    this.networkManager = options.networkManager;

    this.viewAndLayersManager = new HiCViewAndLayersManager(
      this,
      options.response
    );

    this.map = new Map({
      layers: [],
      interactions: [],
    });
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
    this.map.addControl(
      new ScaleLine({
        bar: true,
        text: true,
      })
    );
    this.viewAndLayersManager.initializeMapControls();
  }

  public getOptions() {
    return this.options;
  }

  public getMap(): Map {
    return this.map;
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
    return;
  }

  public onTileSizeChanged(tileSize: number): void {
    throw new Error("Not yet implemented");

    // this.options.tileSize = tileSize;
    // this.viewAndLayersManager.onTileSizeChanged(tileSize);
  }

  public onContigBorderColorChanged(contigBorderColor: string): void {
    throw new Error("Not yet implemented");

    // this.options.contigBorderColor = contigBorderColor;
    // this.viewAndLayersManager.onContigBorderColorChanged(contigBorderColor);
  }

  public onNormalizationChanged(normalizationType: NormalizationType): void{
    this.viewAndLayersManager.onNormalizationChanged(normalizationType);
  }

  public addOSM() {
    this.map.addLayer(
      new TileLayer({
        source: new OSM(),
      })
    );
  }

  public onAddScaffoldClicked(): void {
    this.viewAndLayersManager.currentViewState.activeTool = undefined;
    const startContigId: number | undefined =
      this.viewAndLayersManager.currentViewState.selectionBorders
        .leftContigDescriptorInclusive?.contigId;
    const endContigId: number | undefined =
      this.viewAndLayersManager.currentViewState.selectionBorders
        .rightContigDescriptorInclusive?.contigId;
    if (startContigId === undefined || endContigId === undefined) {
      console.log(
        "Not grouping contigs into scaffold: left border is",
        startContigId,
        " right border is ",
        endContigId
      );
      return;
    }
    this.networkManager.requestManager
      .groupContigsIntoScaffold(
        new GroupContigsIntoScaffoldRequest({
          startContigId: startContigId,
          endContigId: endContigId,
        })
      )
      .then((asmInfo) => {
        this.contigDimensionHolder.updateContigData(asmInfo.contigDescriptors);
        this.scaffoldHolder.updateScaffoldData(asmInfo.scaffoldDescriptors);
        this.reloadVisuals();
      });
  }

  public onRemoveScaffoldClicked(): void {
    this.viewAndLayersManager.currentViewState.activeTool = undefined;
    const startContigId: number | undefined =
      this.viewAndLayersManager.currentViewState.selectionBorders
        .leftContigDescriptorInclusive?.contigId;
    const endContigId: number | undefined =
      this.viewAndLayersManager.currentViewState.selectionBorders
        .rightContigDescriptorInclusive?.contigId;
    if (startContigId === undefined || endContigId === undefined) {
      console.log(
        "Not ungrouping contigs from scaffold: left border is",
        startContigId,
        " right border is ",
        endContigId
      );
      return;
    }
    this.networkManager.requestManager
      .ungroupContigsFromScaffold(
        new UngroupContigsFromScaffoldRequest({
          startContigId: startContigId,
          endContigId: endContigId,
        })
      )
      .then((asmInfo) => {
        this.contigDimensionHolder.updateContigData(asmInfo.contigDescriptors);
        this.scaffoldHolder.updateScaffoldData(asmInfo.scaffoldDescriptors);
        this.reloadVisuals();
      });
  }

  public onReverseSelectionClicked(): void {
    this.viewAndLayersManager.currentViewState.activeTool = undefined;
    const startContigId: number | undefined =
      this.viewAndLayersManager.currentViewState.selectionBorders
        .leftContigDescriptorInclusive?.contigId;
    const endContigId: number | undefined =
      this.viewAndLayersManager.currentViewState.selectionBorders
        .rightContigDescriptorInclusive?.contigId;
    if (startContigId === undefined || endContigId === undefined) {
      console.log(
        "Not reversing selection: left border is",
        startContigId,
        " right border is ",
        endContigId
      );
      return;
    }
    this.networkManager.requestManager
      .reverseSelectionRange(
        new ReverseSelectionRangeRequest({
          startContigId: startContigId,
          endContigId: endContigId,
        })
      )
      .then((asmInfo) => {
        this.contigDimensionHolder.updateContigData(asmInfo.contigDescriptors);
        this.scaffoldHolder.updateScaffoldData(asmInfo.scaffoldDescriptors);
        this.reloadVisuals();
      });
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
    this.viewAndLayersManager.selectionInteractions.translocationArrowSelectionInteraction.unset(
      "startContigId"
    );
    this.viewAndLayersManager.selectionInteractions.translocationArrowSelectionInteraction.unset(
      "endContigId"
    );
  }

  public onMoveSelectionClicked(): void {
    const activeTool = this.viewAndLayersManager.currentViewState.activeTool;
    if (activeTool === ActiveTool.TRANSLOCATION) {
      this.deactivateTranslocation();
    } else {
      const startContigId: number | undefined =
        this.viewAndLayersManager.currentViewState.selectionBorders
          .leftContigDescriptorInclusive?.contigId;
      const endContigId: number | undefined =
        this.viewAndLayersManager.currentViewState.selectionBorders
          .rightContigDescriptorInclusive?.contigId;
      if (startContigId === undefined || endContigId === undefined) {
        console.log(
          "Not moving contigs: left border is",
          startContigId,
          " right border is ",
          endContigId
        );
        return;
      }
      this.viewAndLayersManager.currentViewState.activeTool =
        ActiveTool.TRANSLOCATION;
      this.viewAndLayersManager.selectionInteractions.contigSelectionInteraction.setActive(
        false
      );
      this.viewAndLayersManager.selectionInteractions.translocationArrowSelectionInteraction.setActive(
        true
      );
      this.viewAndLayersManager.selectionInteractions.translocationArrowHoverInteraction.setActive(
        true
      );
      this.viewAndLayersManager.selectionInteractions.translocationArrowSelectionInteraction.set(
        "startContigId",
        startContigId
      );
      this.viewAndLayersManager.selectionInteractions.translocationArrowSelectionInteraction.set(
        "endContigId",
        endContigId
      );
    }

    this.viewAndLayersManager.reloadTracks();
  }

  public onClickInTranslocationMode(): void {
    const interaction =
      this.viewAndLayersManager.selectionInteractions
        .translocationArrowSelectionInteraction;

    const features = interaction.getFeatures();

    const clickedArrow = features.getArray()[0];

    if (!clickedArrow) {
      throw new Error(
        "Click event was sent but no translocation arrow is present?"
      );
    }

    const [leftContigDescriptor, rightContigDescriptor] = [
      "leftContigDescriptor",
      "rightContigDescriptor",
    ].map((key) => clickedArrow.get(key) as ContigDescriptor | undefined);

    const targetOrder: number = leftContigDescriptor
      ? rightContigDescriptor
        ? this.contigDimensionHolder.contigIdToOrd[
            rightContigDescriptor.contigId
          ]
        : this.contigDimensionHolder.contig_count
      : 0;

    const [startContigId, endContigId] = ["startContigId", "endContigId"].map(
      (key) => interaction.get(key) as number
    );

    this.networkManager.requestManager
      .moveSelectionRange(
        new MoveSelectionRangeRequest({
          startContigId: startContigId,
          endContigId: endContigId,
          targetStartOrder: targetOrder,
        })
      )
      .then((asmInfo) => {
        this.contigDimensionHolder.updateContigData(asmInfo.contigDescriptors);
        this.scaffoldHolder.updateScaffoldData(asmInfo.scaffoldDescriptors);
        this.onMoveSelectionClicked();
        this.reloadVisuals();
      });
  }

  public onExportFASTAForSelectionClicked(): void {
    this.deactivateTranslocation();
    const [fromPx, toPx] = [
      this.viewAndLayersManager.currentViewState.selectionBorders.leftPx,
      this.viewAndLayersManager.currentViewState.selectionBorders.rightPx,
    ];
    if (!fromPx || !toPx) {
      console.log(
        "Not exporting FASTA because left selection border is ",
        fromPx,
        " and right selection border is ",
        toPx
      );
    }
    const bpResolution =
      this.viewAndLayersManager.currentViewState.resolutionDesciptor
        .bpResolution;
    const [fromBpX, fromBpY, toBpX, toBpY] = [fromPx, toPx]
      .flatMap((coords) => coords ?? [])
      .map((px) => this.contigDimensionHolder.getStartBpOfPx(px, bpResolution));
    console.log("Bps: ", fromBpX, fromBpY, toBpX, toBpY, " pxs ", fromPx, toPx);

    this.networkManager.requestManager
      .getFASTAForSelection(
        new GetFastaForSelectionRequest({
          fromBpX: fromBpX,
          fromBpY: fromBpY,
          toBpX: toBpX,
          toBpY: toBpY,
        })
      )
      .then((data) => {
        // eslint-disable-next-line
        const blob = new Blob([data as BlobPart], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `(${fromBpX}bp-${toBpX}bp).(${fromBpY}bp-${toBpY}bp).fasta`;
        link.click();
      });
    return;
  }

  public reloadVisuals(): void {
    this.viewAndLayersManager.reloadVisuals();
  }
}

export { ContactMapManager /*, type ContactMapManagerOptions*/ };
