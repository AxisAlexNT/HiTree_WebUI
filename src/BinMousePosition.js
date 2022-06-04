"use strict";

import {MousePosition} from "ol/control";
import {getTransformFromProjections, getUserProjection, identityTransform, transform} from "ol/proj";
import TileLayer from "ol/layer/Tile";

export default class BinMousePosition extends MousePosition {

    constructor(opt_options) {
        super(opt_options);
        if (opt_options.dimension_holder) {
            this.dimension_holder = opt_options.dimension_holder;
        }
    }

    updateHTML_(pixel) {
        let html = this.placeholder_;
        if (pixel && this.mapProjection_) {
            if (!this.transform_) {
                const projection = this.getProjection();
                if (projection) {
                    this.transform_ = getTransformFromProjections(
                        this.mapProjection_,
                        projection
                    );
                } else {
                    this.transform_ = identityTransform;
                }
            }
            const map = this.getMap();
            const coordinate = map.getCoordinateFromPixelInternal(pixel);
            if (coordinate) {
                const userProjection = getUserProjection();
                if (userProjection) {
                    this.transform_ = getTransformFromProjections(
                        this.mapProjection_,
                        userProjection
                    );
                }
                this.transform_(coordinate, coordinate);

                let layers = [];
                map.forEachLayerAtPixel(pixel, function (layer) {
                    layers.push(layer);
                });
                const hovered_layer = (layers.length === 0) ? null : (layers.filter(l => l instanceof TileLayer).sort((l1, l2) => l1.zIndex - l2.zIndex)[0]);
                if (hovered_layer) {
                    const layer_projection = hovered_layer.getSource().getProjection();
                    const pixelResolution = hovered_layer.get('pixelResolution');
                    const fixed_coordinates = transform(coordinate, map.getView().getProjection(), layer_projection).map(c => Math.ceil(c/pixelResolution));
                    const bpResolutionString = hovered_layer.get('bpResolution');
                    const bpResolution = Number(bpResolutionString);
                    const int_coordinates_bins = this.dimension_holder.clampBinCoordinatesAtResolution([Math.floor(fixed_coordinates[0]), -Math.floor(fixed_coordinates[1])], bpResolutionString);


                    html = '<div style="display: block; padding: 20px; background: rgba(0, 0, 0, 0.35); border: 1px solid black; border-radius: 15px; color: white; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">';
                    html += "Global projection coordinate: " + coordinate.map(Math.floor);
                    html = html + "<";
                    html = html + "br/>";

                    html += "Center coordinate: " + map.getView().getCenter().map(Math.floor);
                    html = html + "<";
                    html = html + "br/>";

                    if (fixed_coordinates) {
                        html = html + 'Bin resolution: 1:' + bpResolution;
                        html = html + "<";
                        html = html + "br/>";
                        html = html + "Position: bin1=" + int_coordinates_bins[0] + " bin2=" + int_coordinates_bins[1];
                    }

                    if (this.dimension_holder) {
                        html = html + "<";
                        html = html + "br/>";
                        const bp1 = this.dimension_holder.getStartBpOfBin(int_coordinates_bins[0], bpResolution);
                        const bp2 = this.dimension_holder.getStartBpOfBin(int_coordinates_bins[1], bpResolution);
                        const ctg1 = this.dimension_holder.getContigNameByBin(int_coordinates_bins[0], bpResolution);
                        const ctg2 = this.dimension_holder.getContigNameByBin(int_coordinates_bins[1], bpResolution);
                        html = html + "Position: bp1=" + bp1 + " bp2=" + bp2;
                        html = html + "<";
                        html = html + "br/>";
                        html = html + "Contigs: ctg1=" + ctg1 + " ctg2=" + ctg2;
                    }

                    html += '</div>';
                }
            }
        }
        if (!this.renderedHTML_ || html !== this.renderedHTML_) {
            this.element.innerHTML = html;
            this.renderedHTML_ = html;
        }
    }
}