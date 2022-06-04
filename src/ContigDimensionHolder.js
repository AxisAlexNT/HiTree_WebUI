"use strict";

import binarySearch from "binary-search";
import CommonUtils from "@/CommonUtils";

export default class ContigDimensionHolder {
    constructor(contig_info) {
        this.updateContigData(contig_info);
    }

    updateContigData(contig_info) {
        delete this.contig_size;
        delete this.contig_direction;
        delete this.contig_ord_to_id;
        delete this.contig_names;
        delete this.contig_count;
        this.contig_size = contig_info['contig_size'];
        this.contig_direction = contig_info['contig_direction'];
        this.contig_ord_to_id = contig_info['contig_ord_ids'];
        this.contig_names = contig_info['contig_names'];
        this.contig_count = this.contig_direction.length;
        this.updatePrefixSumBp();
        this.updatePrefixSumBins();
        console.log("Updated using contig_info:", contig_info);
    }

    updatePrefixSumBp() {
        if (this.prefix_sum_bp) {
            delete this.prefix_sum_bp;
        }
        this.prefix_sum_bp = [];

        const contig_length_bp = this.contig_size['0'];
        this.prefix_sum_bp.push(0);

        for (let i = 0; i < this.contig_count; ++i) {
            this.prefix_sum_bp.push(this.prefix_sum_bp[i] + contig_length_bp[i]);
        }
    }

    updatePrefixSumBins() {
        if (this.prefix_sum_bins) {
            delete this.prefix_sum_bins;
        }
        this.prefix_sum_bins = {};

        for (const resolution in this.contig_size) {
            if (resolution === "0") {
                continue;
            }
            const contig_length_bins = this.contig_size[resolution];
            const resolution_prefix_sum = [0];
            for (let i = 0; i < this.contig_count; ++i) {
                resolution_prefix_sum.push(resolution_prefix_sum[i] + contig_length_bins[i]);
            }
            this.prefix_sum_bins[Number(resolution)] = resolution_prefix_sum;
        }
    }

    clampBinCoordinateAtResolution(c, resolution){
        return CommonUtils.clamp(c, 0, this.prefix_sum_bins[resolution].at(-1)-1);
    }

    clampBinCoordinatesAtResolution(c, resolution){
        return c.map(coord => this.clampBinCoordinateAtResolution(coord, resolution));
    }

    getStartBpOfBin_internal(bin_id, resolution) {
        const resolution_string = String(resolution);
        const contig_ord = this.getContigOrderByBin_internal(bin_id, resolution);
        const contig_direction = this.contig_direction[contig_ord];
        const contig_start_bp = this.prefix_sum_bp[contig_ord];
        const contig_start_bins = this.prefix_sum_bins[resolution_string][contig_ord];
        const in_contig_offset_bins = bin_id - contig_start_bins;
        if (contig_direction !== 1) {
            const contig_length_bp = this.contig_size['0'][contig_ord];
            const first_bin_length_in_bp = contig_length_bp % resolution;
            if (in_contig_offset_bins >= 1) {
                return contig_start_bp + first_bin_length_in_bp + resolution * (in_contig_offset_bins - 1);
            } else {
                return contig_start_bp;
            }
        } else {
            return contig_start_bp + resolution * in_contig_offset_bins;
        }
    }

    getStartBpOfBin(bin_id, resolution){
        const start_bp = this.getStartBpOfBin_internal(bin_id, resolution);
        return CommonUtils.clamp(start_bp, 0, this.prefix_sum_bp[this.contig_count]-1);
    }

    getContigIdByBin(bin_id, resolution) {
        return this.contig_ord_to_id[this.getContigOrderByBin_internal(bin_id, resolution)];
    }

    getContigOrderByBin_internal(bin_id, resolution) {
        const contig_ord_containing_bin = binarySearch(this.prefix_sum_bins[resolution], bin_id, (a, b) => a - b);
        return CommonUtils.clamp((contig_ord_containing_bin >= 0) ? contig_ord_containing_bin : (-2 - contig_ord_containing_bin), 0, this.contig_count-1);
    }

    getContigOrderByBp_internal(bp) {
        const contig_ord_containing_bp = binarySearch(this.prefix_sum_bp, bp, (a, b) => a - b);
        return CommonUtils.clamp((contig_ord_containing_bp >= 0) ? contig_ord_containing_bp : (-2 - contig_ord_containing_bp), 0, this.contig_count-1);
    }

    getContigIdByBp(bp) {
        return this.contig_ord_to_id[this.getContigOrderByBp_internal(bp)];
    }

    getBinContainingBp_internal(bp, resolution) {
        const resolution_string = String(resolution);
        const contig_ord = this.getContigOrderByBp_internal(bp);

        const contig_start_bins = this.prefix_sum_bins[resolution_string][contig_ord];

        const contig_direction = this.contig_direction[contig_ord];

        const contig_start_bp = this.prefix_sum_bp[contig_ord];
        const in_contig_offset_bp = bp - contig_start_bp;
        if (contig_direction !== 1) {
            const contig_length_bp = this.contig_size['0'][contig_ord];
            const last_bin_length_bp = contig_length_bp % resolution;
            if (in_contig_offset_bp < last_bin_length_bp) {
                return contig_start_bins;
            }
            return contig_start_bins + 1 + Math.floor((in_contig_offset_bp - last_bin_length_bp) / resolution);
        }
        const in_contig_offset_bins = Math.floor(in_contig_offset_bp / resolution);
        return contig_start_bins + in_contig_offset_bins;
    }

    getBinContainingBp(bp, resolution) {
        const bin_id = this.getBinContainingBp_internal(bp, resolution);
        return CommonUtils.clamp(bin_id, 0, this.prefix_sum_bins[resolution][this.contig_count]-1)
    }

    getContigNameByBp(bp) {
        const contig_ord = this.getContigOrderByBp_internal(bp);
        const contig_id = this.contig_ord_to_id[contig_ord];
        return this.contig_names[contig_id];
    }

    getContigNameByBin(bin_id, resolution) {
        const contig_ord = this.getContigOrderByBin_internal(bin_id, resolution);
        const contig_id = this.contig_ord_to_id[contig_ord];
        return this.contig_names[contig_id];
    }
}