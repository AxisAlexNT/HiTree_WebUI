import CommonUtils from "@/CommonUtils";
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const [startBP, endBP] = [
      this.mapManager.viewAndLayersManager.currentViewState.selectionBorders.leftBP?.reduce(
        (a, b) => Math.min(a, b)
      ),
      this.mapManager.viewAndLayersManager.currentViewState.selectionBorders.rightBP?.reduce(
        (a, b) => Math.max(a, b)
      ),
    ];

    if (startBP === undefined || endBP === undefined) {
      console.log(
        "Not grouping contigs into scaffold from selection: left border bp is",
        startBP,
        " right border bp is ",
        endBP
      );
      return;
    }
    this.mapManager.networkManager.requestManager
      .groupContigsIntoScaffold(
        new GroupContigsIntoScaffoldRequest({
          startBP: startBP,
          endBP: endBP,
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
        this.reloadTracks();
      });
  }

  public onRemoveScaffoldClicked(): void {
    this.mapManager.viewAndLayersManager.currentViewState.activeTool =
      undefined;
    const [startBP, endBP] = [
      this.mapManager.viewAndLayersManager.currentViewState.selectionBorders.leftBP?.reduce(
        (a, b) => Math.min(a, b)
      ),
      this.mapManager.viewAndLayersManager.currentViewState.selectionBorders.rightBP?.reduce(
        (a, b) => Math.max(a, b)
      ),
    ];

    if (startBP === undefined || endBP === undefined) {
      console.log(
        "Not ungrouping contigs from selection: left border bp is",
        startBP,
        " right border bp is ",
        endBP
      );
      return;
    }
    this.mapManager.networkManager.requestManager
      .ungroupContigsFromScaffold(
        new UngroupContigsFromScaffoldRequest({
          startBP: startBP,
          endBP: endBP,
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
        this.reloadTracks();
      });
  }

  public onReverseSelectionClicked(): void {
    this.mapManager.viewAndLayersManager.currentViewState.activeTool =
      undefined;
    const [startBP, endBP] = [
      this.mapManager.viewAndLayersManager.currentViewState.selectionBorders.leftBP?.reduce(
        (a, b) => Math.min(a, b)
      ),
      this.mapManager.viewAndLayersManager.currentViewState.selectionBorders.rightBP?.reduce(
        (a, b) => Math.max(a, b)
      ),
    ];

    if (startBP === undefined || endBP === undefined) {
      console.log(
        "Not reversing selection: left border bp is",
        startBP,
        " right border bp is ",
        endBP
      );
      return;
    }
    this.mapManager.networkManager.requestManager
      .reverseSelectionRange(
        new ReverseSelectionRangeRequest({
          startBP: startBP,
          endBP: endBP,
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
      const [startBP, endBP] = [
        this.mapManager.viewAndLayersManager.currentViewState.selectionBorders.leftBP?.reduce(
          (a, b) => Math.min(a, b)
        ),
        this.mapManager.viewAndLayersManager.currentViewState.selectionBorders.rightBP?.reduce(
          (a, b) => Math.max(a, b)
        ),
      ];

      if (startBP === undefined || endBP === undefined) {
        console.log(
          "Not moving (start) selection: left border bp is",
          startBP,
          " right border bp is ",
          endBP
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
        "startBP",
        startBP
      );
      this.mapManager.viewAndLayersManager.selectionInteractions.translocationArrowSelectionInteraction.set(
        "endBP",
        endBP
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

    let targetOrder: number;
    if (leftContigDescriptor && rightContigDescriptor) {
      targetOrder =
        this.mapManager.contigDimensionHolder.contigIdToOrd[
          rightContigDescriptor.contigId
        ];
    } else if (rightContigDescriptor) {
      targetOrder = 0;
    } else {
      targetOrder = this.mapManager.contigDimensionHolder.contig_count;
    }

    console.log(
      "Click in Translocation mode:",
      "leftContigDescriptor:",
      leftContigDescriptor,
      "rightContigDescirptor:",
      rightContigDescriptor,
      "targetOrder:",
      targetOrder
    );

    const targetBP = CommonUtils.clamp(
      this.mapManager.contigDimensionHolder.prefix_sum_bp[targetOrder],
      0,
      this.mapManager.contigDimensionHolder.prefix_sum_bp[
        this.mapManager.contigDimensionHolder.prefix_sum_bp.length - 1
      ]
    );

    const [startBP, endBP] = ["startBP", "endBP"].map(
      (key) => interaction.get(key) as number
    );

    this.mapManager.networkManager.requestManager
      .moveSelectionRange(
        new MoveSelectionRangeRequest({
          startBP: startBP,
          endBP: endBP,
          targetStartBP: targetBP,
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
