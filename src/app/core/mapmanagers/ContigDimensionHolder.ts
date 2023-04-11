"use strict";

/* TODO: Keep only one binary search module */
import binarySearch from "binary-search";
import bounds from "binary-search-bounds";
import CommonUtils from "@/CommonUtils";
import { ContigDirection, ContigHideType } from "../domain/common";
import type { ContigDescriptor } from "../domain/ContigDescriptor";

export default class ContigDimensionHolder {
  public contig_count = 0;
  public readonly contigIdToOrd: number[] = [];
  public readonly resolutions: number[] = [];

  public contigDescriptors: ContigDescriptor[] = [];

  constructor(contigDescriptors: ContigDescriptor[] | undefined) {
    if (contigDescriptors) {
      this.updateContigData(contigDescriptors);
    }
  }

  public updateContigData(contigDescriptors: ContigDescriptor[]): void {
    this.contigDescriptors.length = 0;
    this.contigDescriptors = contigDescriptors;
    this.contigIdToOrd.length = 0;
    contigDescriptors
      .map((descriptor) => descriptor.contigId)
      .forEach((id, ord) => (this.contigIdToOrd[id] = ord));

    this.resolutions.length = 0;
    for (const resolution of contigDescriptors[0].contigLengthBins.keys()) {
      this.resolutions.push(resolution);
    }

    this.contig_count = this.contigDescriptors.length;
    this.updatePrefixSumBp();
    this.updatePrefixSumBins();
    this.updatePrefixSumPixels();
    console.log("Contig dimension holder: ", this);
  }

  prefix_sum_bp: number[] = [];
  prefix_sum_bins: Map<number, number[]> = new Map<number, number[]>();
  prefix_sum_px: Map<number, number[]> = new Map<number, number[]>();

  protected updatePrefixSumBp(): void {
    this.prefix_sum_bp = [];

    this.prefix_sum_bp.push(0);

    if (!this.contigDescriptors || this.contig_count <= 0) {
      return;
    }

    for (let i = 0; i < this.contig_count; ++i) {
      this.prefix_sum_bp.push(
        this.prefix_sum_bp[i] + this.contigDescriptors[i].contigLengthBp
      );
    }
  }

  protected updatePrefixSumBins(): void {
    this.prefix_sum_bins = new Map();

    if (!this.contigDescriptors || this.contig_count <= 0) {
      return;
    }

    for (const resolution of this.resolutions) {
      this.prefix_sum_bins.set(resolution, [0]);
    }

    this.contigDescriptors.forEach((ctg, i) => {
      for (const [
        resolution,
        lengthBinsAtResolution,
      ] of ctg.contigLengthBins.entries()) {
        const resolutionPrefixSum: number[] | undefined =
          this.prefix_sum_bins.get(resolution);
        if (resolutionPrefixSum) {
          resolutionPrefixSum.push(
            resolutionPrefixSum[i] + lengthBinsAtResolution
          );
        } else {
          throw new Error(
            `Unknown resolution ${resolution} in updatePrefixSumBins`
          );
        }
      }
    });
  }

  protected updatePrefixSumPixels(): void {
    this.prefix_sum_px = new Map();

    if (!this.contigDescriptors || this.contig_count <= 0) {
      return;
    }

    for (const resolution of this.resolutions) {
      this.prefix_sum_px.set(resolution, [0]);
    }

    this.contigDescriptors.forEach((ctg, ctgOrder) => {
      ctg.presenceAtResolution.forEach((hideTypeAtResolution, resolution) => {
        const resolutionPrefixSum: number[] | undefined =
          this.prefix_sum_px.get(resolution);
        if (!resolutionPrefixSum) {
          throw new Error(
            `Unknown resolution ${resolution} in updatePrefixSumPx`
          );
        }
        switch (hideTypeAtResolution) {
          case ContigHideType.AUTO_HIDDEN:
          case ContigHideType.FORCED_HIDDEN:
            resolutionPrefixSum.push(resolutionPrefixSum[ctgOrder]);
            break;
          case ContigHideType.AUTO_SHOWN:
          case ContigHideType.FORCED_SHOWN:
            {
              const lengthBinsAtResolution: number | undefined =
                ctg.contigLengthBins.get(resolution);
              if (lengthBinsAtResolution) {
                const res =
                  resolutionPrefixSum[ctgOrder] + lengthBinsAtResolution;
                resolutionPrefixSum.push(res);
              } else {
                throw new Error(
                  `Unknown resolution ${resolution} in updatePrefixSumPx`
                );
              }
            }
            break;
          default:
            throw new Error(
              `Unrecognized contig hide type: ${hideTypeAtResolution}`
            );
        }
      });
    });
  }

  protected clampBinCoordinateAtResolution(
    coordinate: number,
    resolution: number
  ): number {
    const resolution_prefix_sum = this.prefix_sum_bins.get(resolution);
    if (resolution_prefix_sum) {
      return CommonUtils.clamp(
        coordinate,
        0,
        resolution_prefix_sum[resolution_prefix_sum.length - 1] - 1
      );
    } else {
      throw new Error("Missing resolution: " + resolution);
    }
  }

  public clampBinCoordinatesAtResolution(
    coordinates: number[],
    resolution: number
  ) {
    return coordinates.map((coordinate) =>
      this.clampBinCoordinateAtResolution(coordinate, resolution)
    );
  }

  public clampPxCoordinateAtResolution(
    coordinate: number,
    resolution: number
  ): number {
    const resolution_prefix_sum = this.prefix_sum_px.get(resolution);
    if (resolution_prefix_sum) {
      return CommonUtils.clamp(
        coordinate,
        0,
        resolution_prefix_sum[resolution_prefix_sum.length - 1] - 1
      );
    } else {
      throw new Error("Missing resolution: " + resolution);
    }
  }

  public clampPxCoordinatesAtResolution(
    coordinates: number[],
    resolution: number
  ) {
    return coordinates.map((coordinate) =>
      this.clampPxCoordinateAtResolution(coordinate, resolution)
    );
  }

  public getContigOrderByBin(bin_id: number, resolution: number): number {
    const prefix_sum_bins = this.prefix_sum_bins.get(resolution);
    if (!prefix_sum_bins) {
      throw new Error("Unknown resolution for prefix_sum_bins: " + resolution);
    }
    const contig_ord_containing_bin = binarySearch(
      prefix_sum_bins,
      bin_id,
      (a, b) => a - b
    );
    return CommonUtils.clamp(
      contig_ord_containing_bin >= 0
        ? contig_ord_containing_bin
        : -2 - contig_ord_containing_bin,
      0,
      this.contig_count - 1
    );
  }

  // ord 0 1 2 3 4 5
  // ctg A B C D E F
  // len 0 2 0 0 2 3
  // sum 0 0 2 2 2 4 7
  //             ^
  // search(2)
  //       ^
  // search(0)
  //               ^
  // search(5)
  // Points to the last less than or equal ==> le-query
  //               ^
  // search(4)
  //             ^
  // search(3)

  public getContigOrderByPx(px: number, resolution: number): number {
    const prefix_sum_px = this.prefix_sum_px.get(resolution);
    if (!prefix_sum_px) {
      throw new Error("Unknown resolution for prefix_sum_px: " + resolution);
    }
    const contig_ord_containing_px = bounds.le(prefix_sum_px, px);
    return contig_ord_containing_px;
  }

  protected getStartBpOfBin_internal(
    bin_id: number,
    resolution: number
  ): number {
    const contig_ord = this.getContigOrderByBin(bin_id, resolution);
    const contig_direction = this.contigDescriptors[contig_ord].direction;
    const contig_start_bp = this.prefix_sum_bp[contig_ord];
    const contig_start_bins = (this.prefix_sum_bins.get(resolution) ?? [])[
      contig_ord
    ];
    const in_contig_offset_bins = bin_id - contig_start_bins;
    if (contig_direction !== ContigDirection.FORWARD) {
      const contig_length_bp =
        this.contigDescriptors[contig_ord].contigLengthBp;
      const first_bin_length_in_bp = contig_length_bp % resolution;
      if (in_contig_offset_bins >= 1) {
        return (
          contig_start_bp +
          first_bin_length_in_bp +
          resolution * (in_contig_offset_bins - 1)
        );
      } else {
        return contig_start_bp;
      }
    } else {
      return contig_start_bp + resolution * in_contig_offset_bins;
    }
  }

  protected getStartBpOfPx_internal(px: number, resolution: number): number {
    const contig_ord = this.getContigOrderByPx(px, resolution);
    // console.log(
    //   `${px}, ${contig_ord}, ${this.contigDescriptors.length}, ${this.contigDescriptors[contig_ord]}`
    // );
    const contig_direction = this.contigDescriptors[CommonUtils.clamp(contig_ord, 0,  this.contigDescriptors.length-1)].direction;
    const contig_start_bp = this.prefix_sum_bp[contig_ord];
    const contig_start_px = (this.prefix_sum_px.get(resolution) ?? [])[
      contig_ord
    ];
    const in_contig_offset_bins = px - contig_start_px;
    if (contig_direction !== ContigDirection.FORWARD) {
      const contig_length_bp =
        this.contigDescriptors[contig_ord].contigLengthBp;
      const first_bin_length_in_bp = contig_length_bp % resolution;
      if (in_contig_offset_bins >= 1) {
        return (
          contig_start_bp +
          first_bin_length_in_bp +
          resolution * (in_contig_offset_bins - 1)
        );
      } else {
        return contig_start_bp;
      }
    } else {
      return contig_start_bp + resolution * in_contig_offset_bins;
    }
  }

  public getStartBpOfBin(bin_id: number, resolution: number): number {
    const start_bp = this.getStartBpOfBin_internal(bin_id, resolution);
    return CommonUtils.clamp(
      start_bp,
      0,
      this.prefix_sum_bp[this.contig_count] - 1
    );
  }

  public getStartBpOfPx(px: number, resolution: number): number {
    const start_bp = this.getStartBpOfPx_internal(px, resolution);
    return CommonUtils.clamp(
      start_bp,
      0,
      this.prefix_sum_bp[this.contig_count] - 1
    );
  }

  public getContigIdByBin(bin_id: number, resolution: number): number {
    return this.contigDescriptors[this.getContigOrderByBin(bin_id, resolution)]
      .contigId;
  }

  public getContigIdByPx(px: number, resolution: number): number {
    return this.contigDescriptors[this.getContigOrderByPx(px, resolution)]
      .contigId;
  }

  protected getContigOrderByBp_internal(bp: number): number {
    const contig_ord_containing_bp = binarySearch(
      this.prefix_sum_bp,
      bp,
      (a, b) => a - b
    );
    return CommonUtils.clamp(
      contig_ord_containing_bp >= 0
        ? contig_ord_containing_bp
        : -2 - contig_ord_containing_bp,
      0,
      this.contig_count - 1
    );
  }

  public getContigIdByBp(bp: number): number {
    return this.contigDescriptors[this.getContigOrderByBp_internal(bp)]
      .contigId;
  }

  protected getBinContainingBp_internal(
    bp: number,
    resolution: number
  ): number {
    const contig_ord = this.getContigOrderByBp_internal(bp);

    const contig_start_bins = (this.prefix_sum_bins.get(resolution) ?? [])[
      contig_ord
    ];

    const contig_direction = this.contigDescriptors[contig_ord].direction;

    const contig_start_bp = this.prefix_sum_bp[contig_ord];
    const in_contig_offset_bp = bp - contig_start_bp;
    if (contig_direction !== ContigDirection.FORWARD) {
      const contig_length_bp =
        this.contigDescriptors[contig_ord].contigLengthBp;
      const last_bin_length_bp = contig_length_bp % resolution;
      if (in_contig_offset_bp < last_bin_length_bp) {
        return contig_start_bins;
      }
      return (
        contig_start_bins +
        1 +
        Math.floor((in_contig_offset_bp - last_bin_length_bp) / resolution)
      );
    }
    const in_contig_offset_bins = Math.floor(in_contig_offset_bp / resolution);
    return contig_start_bins + in_contig_offset_bins;
  }

  public getBinContainingBp(bp: number, resolution: number): number {
    const bin_id = this.getBinContainingBp_internal(bp, resolution);
    return CommonUtils.clamp(
      bin_id,
      0,
      (this.prefix_sum_bins.get(resolution) ?? [])[this.contig_count] - 1
    );
  }

  protected getPxContainingBp_internal(bp: number, resolution: number): number {
    const contig_ord = this.getContigOrderByBp_internal(bp);

    const contig_start_px = (this.prefix_sum_px.get(resolution) ?? [])[
      contig_ord
    ];

    const contig_hide_type =
      this.contigDescriptors[contig_ord].presenceAtResolution.get(resolution);

    switch (contig_hide_type) {
      case ContigHideType.AUTO_HIDDEN:
      case ContigHideType.FORCED_HIDDEN:
        return contig_start_px;
      default:
        break;
    }

    const contig_direction = this.contigDescriptors[contig_ord].direction;

    const contig_start_bp = this.prefix_sum_bp[contig_ord];
    const in_contig_offset_bp = bp - contig_start_bp;
    if (contig_direction !== ContigDirection.FORWARD) {
      const contig_length_bp =
        this.contigDescriptors[contig_ord].contigLengthBp;
      const last_bin_length_bp = contig_length_bp % resolution;
      if (in_contig_offset_bp < last_bin_length_bp) {
        return contig_start_px;
      }
      return (
        contig_start_px +
        1 +
        Math.floor((in_contig_offset_bp - last_bin_length_bp) / resolution)
      );
    }
    const in_contig_offset_bins = Math.floor(in_contig_offset_bp / resolution);
    return contig_start_px + in_contig_offset_bins;
  }

  public getPxContainingBp(bp: number, resolution: number): number {
    const px = this.getPxContainingBp_internal(bp, resolution);
    return CommonUtils.clamp(
      px,
      0,
      (this.prefix_sum_px.get(resolution) ?? [])[this.contig_count] - 1
    );
  }

  public getContigNameByBp(bp: number): string {
    const contig_ord = this.getContigOrderByBp_internal(bp);
    return this.contigDescriptors[contig_ord].contigName;
  }

  public getContigNameByBin(bin_id: number, resolution: number): string {
    const contig_ord = this.getContigOrderByBin(bin_id, resolution);
    return this.contigDescriptors[contig_ord].contigName;
  }

  public getContigNameByPx(px: number, resolution: number): string {
    const contig_ord = this.getContigOrderByPx(px, resolution);
    return this.contigDescriptors[contig_ord].contigName;
  }

  public getContigIdByContigOrder(contig_order: number): number {
    if (0 <= contig_order && contig_order < this.contig_count) {
      return this.contigDescriptors[contig_order].contigId;
    } else {
      throw new Error(
        "Contig order is out of range [0, " + this.contig_count + ")"
      );
    }
  }

  public getContigOrderByContigId(contig_id: number): number {
    if (0 <= contig_id && contig_id < this.contig_count) {
      return this.contigIdToOrd[contig_id];
    } else {
      throw new Error(
        "Contig id is out of range [0, " + this.contig_count + ")"
      );
    }
  }

  public pixelToBin(px: number, resolution: number): number {
    const px_start_bp = this.getStartBpOfPx(px, resolution);
    return this.getBinContainingBp(px_start_bp, resolution);
  }

  public pixelsToBins(pixels: number[], resolution: number): number[] {
    return pixels.map((px) => this.pixelToBin(px, resolution));
  }

  public binToPixel(bin_id: number, resolution: number): number {
    const bin_start_bp = this.getStartBpOfBin(bin_id, resolution);
    return this.getPxContainingBp(bin_start_bp, resolution);
  }

  public binsToPixels(bin_ids: number[], resolution: number): number[] {
    return bin_ids.map((bin_id) => this.binToPixel(bin_id, resolution));
  }
}
