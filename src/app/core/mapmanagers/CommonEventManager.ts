import {
  ContrastRangeSettings,
  NormalizationSettings,
} from "@/app/ui/components/ComponentCommon";
import { ContigDescriptor } from "../domain/ContigDescriptor";
import {
  GroupContigsIntoScaffoldRequest,
  UngroupContigsFromScaffoldRequest,
  ReverseSelectionRangeRequest,
  MoveSelectionRangeRequest,
  GetFastaForSelectionRequest,
  SetNormalizationRequest,
  SetContrastRangeRequest,
} from "../net/api/request";
import { ContactMapManager } from "./ContactMapManager";
import { ActiveTool } from "./HiCViewAndLayersManager";
import { BorderStyle } from "@/app/core/tracks/Track2DSymmetric";

class CommonEventManager {
  public constructor(public readonly mapManager: ContactMapManager) {}

  public reloadTiles() {
    this.mapManager.reloadTiles();
  }

  public reloadVisuals() {
    this.mapManager.reloadVisuals();
  }

  public reloadTracks() {
    this.mapManager.viewAndLayersManager.reloadTracks();
  }

  public onTileSizeChanged(tileSize: number): void {
    throw new Error("Not yet implemented");

    // this.mapManager.options.tileSize = tileSize;
    // this.mapManager.viewAndLayersManager.onTileSizeChanged(tileSize);
  }

  public onContigBorderColorChanged(newColor: string): void {
    this.mapManager.viewAndLayersManager.onContigBorderColorChanged(newColor);
  }

  public onScanffoldBorderColorChanged(newColor: string): void {
    this.mapManager.viewAndLayersManager.onScanffoldBorderColorChanged(
      newColor
    );
  }

  public onContigBorderStyleChanged(style: BorderStyle): void {
    this.mapManager.viewAndLayersManager.onContigBorderStyleChanged(style);
  }

  public onScanffoldBorderStyleChanged(style: BorderStyle): void {
    this.mapManager.viewAndLayersManager.onScanffoldBorderStyleChanged(style);
  }

  public onNormalizationChanged(
    normalizationSettings: NormalizationSettings
  ): void {
    this.mapManager.networkManager.requestManager
      .sendRequest(
        new SetNormalizationRequest({
          normalizationSettings: normalizationSettings,
        })
      )
      .then(() => this.mapManager.viewAndLayersManager.reloadTiles())
      .catch(alert);
  }

  public onContrastChanged(contrastRangeSettings: ContrastRangeSettings): void {
    this.mapManager.networkManager.requestManager
      .sendRequest(
        new SetContrastRangeRequest({
          contrastRangeSettings: contrastRangeSettings,
        })
      )
      .then(() => {
        this.reloadTiles();
      })
      .catch(alert);
  }

  public onAddScaffoldClicked(): void {
    this.mapManager.viewAndLayersManager.currentViewState.activeTool =
      undefined;
    const startContigId: number | undefined =
      this.mapManager.viewAndLayersManager.currentViewState.selectionBorders
        .leftContigDescriptorInclusive?.contigId;
    const endContigId: number | undefined =
      this.mapManager.viewAndLayersManager.currentViewState.selectionBorders
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
    this.mapManager.networkManager.requestManager
      .groupContigsIntoScaffold(
        new GroupContigsIntoScaffoldRequest({
          startContigId: startContigId,
          endContigId: endContigId,
        })
      )
      .then((asmInfo) => {
        this.mapManager.contigDimensionHolder.updateContigData(
          asmInfo.contigDescriptors
        );
        this.mapManager.scaffoldHolder.updateScaffoldData(
          asmInfo.scaffoldDescriptors
        );
        this.resetSelection();
        this.mapManager.reloadVisuals();
      });
  }

  public onRemoveScaffoldClicked(): void {
    this.mapManager.viewAndLayersManager.currentViewState.activeTool =
      undefined;
    const startContigId: number | undefined =
      this.mapManager.viewAndLayersManager.currentViewState.selectionBorders
        .leftContigDescriptorInclusive?.contigId;
    const endContigId: number | undefined =
      this.mapManager.viewAndLayersManager.currentViewState.selectionBorders
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
    this.mapManager.networkManager.requestManager
      .ungroupContigsFromScaffold(
        new UngroupContigsFromScaffoldRequest({
          startContigId: startContigId,
          endContigId: endContigId,
        })
      )
      .then((asmInfo) => {
        this.mapManager.contigDimensionHolder.updateContigData(
          asmInfo.contigDescriptors
        );
        this.mapManager.scaffoldHolder.updateScaffoldData(
          asmInfo.scaffoldDescriptors
        );
        this.resetSelection();
        this.mapManager.reloadVisuals();
      });
  }

  public onReverseSelectionClicked(): void {
    this.mapManager.viewAndLayersManager.currentViewState.activeTool =
      undefined;
    const startContigId: number | undefined =
      this.mapManager.viewAndLayersManager.currentViewState.selectionBorders
        .leftContigDescriptorInclusive?.contigId;
    const endContigId: number | undefined =
      this.mapManager.viewAndLayersManager.currentViewState.selectionBorders
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
    this.mapManager.networkManager.requestManager
      .reverseSelectionRange(
        new ReverseSelectionRangeRequest({
          startContigId: startContigId,
          endContigId: endContigId,
        })
      )
      .then((asmInfo) => {
        this.mapManager.contigDimensionHolder.updateContigData(
          asmInfo.contigDescriptors
        );
        this.mapManager.scaffoldHolder.updateScaffoldData(
          asmInfo.scaffoldDescriptors
        );
        this.resetSelection();
        this.mapManager.reloadVisuals();
      });
  }

  public onMoveSelectionClicked(): void {
    const activeTool =
      this.mapManager.viewAndLayersManager.currentViewState.activeTool;
    if (activeTool === ActiveTool.TRANSLOCATION) {
      this.mapManager.deactivateTranslocation();
    } else {
      const startContigId: number | undefined =
        this.mapManager.viewAndLayersManager.currentViewState.selectionBorders
          .leftContigDescriptorInclusive?.contigId;
      const endContigId: number | undefined =
        this.mapManager.viewAndLayersManager.currentViewState.selectionBorders
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
      this.mapManager.viewAndLayersManager.currentViewState.activeTool =
        ActiveTool.TRANSLOCATION;
      this.mapManager.viewAndLayersManager.selectionInteractions.contigSelectionInteraction.setActive(
        false
      );
      this.mapManager.viewAndLayersManager.selectionInteractions.translocationArrowSelectionInteraction.setActive(
        true
      );
      this.mapManager.viewAndLayersManager.selectionInteractions.translocationArrowHoverInteraction.setActive(
        true
      );
      this.mapManager.viewAndLayersManager.selectionInteractions.translocationArrowSelectionInteraction.set(
        "startContigId",
        startContigId
      );
      this.mapManager.viewAndLayersManager.selectionInteractions.translocationArrowSelectionInteraction.set(
        "endContigId",
        endContigId
      );
    }

    this.mapManager.viewAndLayersManager.reloadTracks();
  }

  public onClickInTranslocationMode(): void {
    const interaction =
      this.mapManager.viewAndLayersManager.selectionInteractions
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
        ? this.mapManager.contigDimensionHolder.contigIdToOrd[
            rightContigDescriptor.contigId
          ]
        : this.mapManager.contigDimensionHolder.contig_count
      : 0;

    const [startContigId, endContigId] = ["startContigId", "endContigId"].map(
      (key) => interaction.get(key) as number
    );

    this.mapManager.networkManager.requestManager
      .moveSelectionRange(
        new MoveSelectionRangeRequest({
          startContigId: startContigId,
          endContigId: endContigId,
          targetStartOrder: targetOrder,
        })
      )
      .then((asmInfo) => {
        this.mapManager.contigDimensionHolder.updateContigData(
          asmInfo.contigDescriptors
        );
        this.mapManager.scaffoldHolder.updateScaffoldData(
          asmInfo.scaffoldDescriptors
        );
        this.onMoveSelectionClicked();
        this.resetSelection();
        this.mapManager.reloadVisuals();
      });
  }

  public onExportFASTAForSelectionClicked(): void {
    this.mapManager.deactivateTranslocation();
    const [fromPx, toPx] = [
      this.mapManager.viewAndLayersManager.currentViewState.selectionBorders
        .leftPx,
      this.mapManager.viewAndLayersManager.currentViewState.selectionBorders
        .rightPx,
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
      this.mapManager.viewAndLayersManager.currentViewState.resolutionDesciptor
        .bpResolution;
    const [fromBpX, fromBpY, toBpX, toBpY] = [fromPx, toPx]
      .flatMap((coords) => coords ?? [])
      .map((px) =>
        this.mapManager.contigDimensionHolder.getStartBpOfPx(px, bpResolution)
      );
    console.log("Bps: ", fromBpX, fromBpY, toBpX, toBpY, " pxs ", fromPx, toPx);

    this.mapManager.networkManager.requestManager
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
        link.download = `selection_(${fromBpX}bp-${toBpX}bp).(${fromBpY}bp-${toBpY}bp).fasta`;
        link.click();
      });
    return;
  }

  public resetSelection(): void {
    const extentInteraction =
      this.mapManager.viewAndLayersManager.selectionInteractions
        .contigSelectExtent;
    // @ts-expect-error "Extent should be reset"
    extentInteraction.setExtent(undefined);
    extentInteraction.changed();
  }
}

export { CommonEventManager };
