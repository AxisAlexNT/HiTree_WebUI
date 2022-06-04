<template>
  <div class="element-outer">
    <div id="map" class="map"></div>
  </div>

  <div class="element-outer">
    <form name="internal-form" @submit.prevent="">
      <div class="form-header">
        <h3 id="create-new-user-label">Fragmented file</h3>
      </div>

      <table class="tg">
        <thead>
        <tr>
          <td class="tg-0lax">
            <div>
              <label class="form-field" for="filename-field">
                Filename:
              </label>
              <input id="filename-field" v-model="filename" aria-required="true" class="form-control long-text-field"
                     maxlength="255"
                     name="filename-field"
                     required="required" type="text">
            </div>
            <br>
            <div>
              <label class="form-field" for="filename-field">
                FASTA:
              </label>
              <input id="filename-field" v-model="fasta_filename"
                     class="form-control long-text-field"
                     maxlength="255"
                     name="filename-field"
                     type="text">
            </div>
            <br>
            <div class="button-field">
              <button type="submit" value="Submit" @click="onOpenFileSubmit">Open file</button>
            </div>
            <div class="button-field">
              <button type="submit" value="Submit" @click="reloadTiles">Reload tiles</button>
            </div>
            <div class="button-field">
              <button type="submit" value="Submit" @click="save">Save changes</button>
            </div>
            <div class="button-field">
              <button type="submit" value="Submit" @click="getAssembly">Get assembly</button>
            </div>
          </td>
          <td class="tg-0lax">
            <div class="element-outer" v-if="responseMessage && image_sizes">
              <div class="button-field">
                <select v-model="contigToRotate">
                  <option disabled value="">Please select one</option>
                  <option v-for="(contig_name, contig_id) in responseMessage.contig_info.contig_names"
                          :value="contig_id"
                          :key="contig_id">
                    ID{{ contig_id }}: {{ contig_name }}
                  </option>
                </select>
                <button type="submit" value="Rotate" @click="rotateContig">Rotate contig</button>
              </div>
            </div>
          </td>
          <td class="tg-0lax">
            <div class="element-outer dt" v-if="responseMessage && image_sizes">
              <div class="dtc">
                <p>Move contig</p>
              </div>
              <div class="dtc">
                <select v-model="contigToMove">
                  <option disabled value="">Please select one</option>
                  <option v-for="(contig_name, contig_id) in responseMessage.contig_info.contig_names"
                          :value="contig_id"
                          :key="contig_id">
                    ID{{ contig_id }}: {{ contig_name }}
                  </option>
                </select>
              </div>
              <div class="dtc">
                <p> and place on position: </p>
              </div>
              <div class="dtc">
                <input type="number" v-model="moveTargetIndex"
                       min="0" :max="responseMessage.contig_info.contig_direction.length-1">
              </div>
              <div class="dtc">
                <button type="submit" value="Move" @click="moveContig">Move contig</button>
              </div>
            </div>
          </td>
        </tr>
        </thead>
      </table>


    </form>
  </div>
  <div class="element-outer">
    <label v-if="(errorMsg === null) && (responseMessage !== null)" id="result_label"
           class="ok-message">
      {{ responseMessage }}
    </label>
    <label v-if="(errorMsg!=null)&&(responseMessage===null)" id="error_label" class="error-message">
      Error while opening file: {{ errorMsg }}
    </label>
  </div>
</template>

<script>
'use strict';
import axios from "axios";
import 'ol/ol.css';
import Map from 'ol/Map';
import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import {ScaleLine, ZoomSlider} from "ol/control";
import {
  Projection
} from 'ol/proj';
import Units from "ol/proj/Units";
import TileGrid from "ol/tilegrid/TileGrid";
import BinMousePosition from "@/BinMousePosition";
import ContigDimensionHolder from "@/ContigDimensionHolder";
import {DoubleClickZoom, DragPan} from 'ol/interaction';
import ContigMouseWheelZoom from "@/ContigMouseWheelZoom";


export default {
  name: 'App',
  data: function () {
    return {
      host: "http://localhost:5000/",
      filename: "coluzzii.mcool.hdf5",
      fasta_filename: "coluzzii.fasta",
      errorMsg: null,
      responseMessage: null,
      tile_size: 256,
      map: null,
      pixelResolutionSet: null,
      resolutions: null,
      pixelProjection: null,
      tileGrid: null,
      image_sizes: null,
      image_extents: null,
      view: null,
      layer_projections: null,
      contig_dimension_holder: null,
      imageSizeScaled: null,
      hicDataLayers: null,
      hicDataSources: null,
      contigToRotate: null,
      contigToMove: null,
      moveTargetIndex: 0,
      contig_info: null,
    }
  },
  methods: {
    resetAttrs() {
      this.responseMessage = null;
      this.errorMsg = null;
      delete this.view;
      if (this.map) {
        this.map.setTarget(null);
        delete this.map;
      }
      delete this.layer_projections;
      delete this.pixelProjection;
      delete this.pixelResolutionSet;
      delete this.resolutions;
      delete this.tileGrid;
      delete this.image_sizes;
      delete this.image_extents;
      delete this.contig_dimension_holder;
      delete this.imageSizeScaled;
      delete this.hicDataLayers;
      delete this.hicDataSources;
      delete this.contig_info;
    },
    reloadTiles() {
      if (this.map === null) {
        return;
      }
      for (const layer of this.hicDataLayers) {
        const source = layer.getSource();
        source.do_reload();
        source['tileCache'].expireCache({});
        source['tileCache'].clear();
        source.changed();
      }
    },
    rotateContig() {
      if (this.contigToRotate) {
        let query_payload = {filename: this.filename, contigToRotate: this.contigToRotate};
        axios
            .post(this.host + '/reverse', query_payload)
            .then(response => {
                  const contig_info = response.data['contig_info'];
                  this.contig_dimension_holder.updateContigData(contig_info);
                  this.reloadTiles();
                }
            )
            .catch(this.responseErrorHandler);
      }
    },
    moveContig() {
      if ((this.contigToMove || this.contigToMove === 0) && (this.moveTargetIndex || this.moveTargetIndex === 0)) {
        let query_payload = {
          filename: this.filename,
          contigToMove: this.contigToMove,
          targetIndex: this.moveTargetIndex
        };
        axios
            .post(this.host + '/move', query_payload)
            .then(response => {
                  const contig_info = response.data['contig_info'];
                  this.contig_dimension_holder.updateContigData(contig_info);
                  this.reloadTiles();
                }
            )
            .catch(this.responseErrorHandler);
      }
    },
    save() {
      if (this.filename) {
        let query_payload = {filename: this.filename};
        axios
            .post(this.host + '/save', query_payload)
            .then(response => {
                  const contig_info = response.data['contig_info'];
                  this.contig_dimension_holder.updateContigData(contig_info);
                  this.reloadTiles();
                }
            )
            .catch(this.responseErrorHandler);
      }
    },
    responseErrorHandler(err) {
      this.resetAttrs();
      if (err.response) {
        this.errorMsg = err.response.data;
      } else {
        this.errorMsg = err;
      }
    },
    getAssembly() {
      axios
          .post(
              this.host + "/get_fasta_for_assembly", {
                data: {fasta_filename: this.fasta_filename},
                responseType: 'arraybuffer'
              }
          )
          .then(response => {
            let blob = new Blob([response.data], {type: 'text/plain'});
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = this.filename + ".assembly.fasta.txt";
            link.click();
          })
          .catch(this.responseErrorHandler);
    },
    onOpenFileSubmit() {
      let query_payload = {filename: this.filename, fasta_filename: this.fasta_filename};
      axios
          .get(this.host + '/open', {params: query_payload})
          .then(response => {
                // Reset component attributes:
                this.resetAttrs();
                // Display response:
                this.responseMessage = response.data;
                // Prepare dimension holder:
                this.contig_dimension_holder = new ContigDimensionHolder(response.data['contig_info']);
                // Set component attributes:
                this.image_sizes = response.data['sizes'];
                this.tile_size = 256; //response.data['tile_size'];
                this.pixelResolutionSet = response.data['pixel_resolutions'];
                this.resolutions = response.data['resolutions'];
                this.imageSizeScaled = [];
                this.hicDataLayers = [];
                this.hicDataSources = [];
                for (let i = 0; i < this.pixelResolutionSet.length; ++i) {
                  this.imageSizeScaled.push(this.image_sizes[i] * this.pixelResolutionSet[i]);
                }
                console.log("Scaled image sizes: ", this.imageSizeScaled);
                // Calculate extents for projection:
                const maximum_scaled_image_size = Math.max(...this.image_sizes);
                const maximum_global_extent = [0, -maximum_scaled_image_size, maximum_scaled_image_size, 0];
                // Define projection:
                this.pixelProjection = new Projection({
                  code: "pixelate",
                  units: Units.PIXELS,
                  metersPerUnit: undefined,
                  extent: maximum_global_extent,
                  axisOrientation: 'esu', // OK, axis orientation is changed in layer projections
                  global: false,
                  getPointResolution: (resolution) => resolution
                });
                this.layer_projections = [];
                // Define view:
                this.view = new View({
                  center: [this.pixelProjection.getExtent()[0], this.pixelProjection.getExtent()[3]],
                  resolutions: this.pixelResolutionSet,
                  resolution: Math.max(...this.pixelResolutionSet),
                  minResolution: Math.min(...this.pixelResolutionSet),
                  maxResolution: Math.max(...this.pixelResolutionSet),
                  showFullExtent: true,
                  constrainOnlyCenter: true,
                  projection: this.pixelProjection,
                  extent: maximum_global_extent
                });
                // Define the map:
                this.map = new Map({
                  layers: [],
                  target: 'map',
                  view: this.view,
                  interactions: [], //interaction_defaults({mouseWheelZoom: false}),
                });
                // Add some more controls:
                this.map.addControl(new ZoomSlider());
                this.map.addControl(new ScaleLine({
                  bar: true,
                  text: true,
                }));
                this.map.addControl(new BinMousePosition({
                  projection: this.pixelProjection,
                  dimension_holder: this.contig_dimension_holder,
                }));
                this.map.addInteraction(new DoubleClickZoom());
                this.map.addInteraction(new DragPan());
                // Add layers to the view (create tile grid -> create source -> create layer -> map.addLayer):
                for (let i = 0; i < this.image_sizes.length; ++i) {
                  // Prepare parameters:

                  const layer_resolution = this.pixelResolutionSet[i];
                  const layer_image_size = this.image_sizes[i] * layer_resolution;
                  const scaled_layer_extent = [0, -layer_image_size, layer_image_size, 0];
                  const layer_tilegrid = new TileGrid({
                    extent: scaled_layer_extent,
                    resolutions: [layer_resolution],
                    tileSize: [this.tile_size, this.tile_size],
                  });
                  const create_tile_url_function = (version) => {
                    return (coord_zxy) => {
                      let col = coord_zxy[1];
                      let row = coord_zxy[2];
                      return this.host + "get_tile?version=" + version + "&level=" + (1 + i) + "&row=" + row + "&col=" + col + "&tile_size=" + this.tile_size;
                    };
                  }
                  // Create source for current layer:
                  const layer_source = new XYZ({
                    // projection: layer_projection,
                    projection: this.pixelProjection,
                    tileUrlFunction: create_tile_url_function(0),
                    tileGrid: layer_tilegrid,
                    interpolate: false,
                    cacheSize: 0,
                    // transition: 0,
                  });
                  layer_source.version = 0;
                  layer_source.do_reload = () => {
                    layer_source.version += 1;
                    layer_source.setTileUrlFunction(create_tile_url_function(layer_source.version));
                  };
                  this.hicDataSources.push(layer_source);
                  // Define layer:
                  const layer = new TileLayer({
                        source: layer_source,
                        // cacheSize: 0,
                        minResolution: (i === this.image_sizes.length - 1) ? undefined : (this.pixelResolutionSet[i]),
                        maxResolution: (i === 0) ? undefined : (this.pixelResolutionSet[i - 1]),
                        zIndex: 2 * i,
                      }
                  );
                  layer.set('bpResolution', this.resolutions[i]);
                  layer.set('pixelResolution', this.pixelResolutionSet[i]);
                  this.map.addLayer(layer);
                  this.hicDataLayers.push(layer);
                }


                this.map.addInteraction(new ContigMouseWheelZoom({
                  dimension_holder: this.contig_dimension_holder,
                  resolutions: this.resolutions,
                  pixelResolutionSet: this.pixelResolutionSet,
                  global_projection: this.pixelProjection,
                  layer_projections: this.layer_projections,
                }));
              }
          )
          .catch(this.responseErrorHandler);
    }
  }
  ,
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.ok-message {
  color: limegreen;
}

.error-message {
  color: red;
}

.element-outer {
  text-align: justify;
  border-radius: 10px;
  border-width: 1px;
  border-color: gray;
  border-style: solid;
  padding: 10px;
  width: 80%;
  margin: 20px;
}

.form-control {
  margin: 2px;
}

.form-field {
  margin-left: 10px;
}

.long-text-field {
  width: 80%;
}

.map {
  width: 100%;
  height: 700px;
  /*width: 256px;*/
  /*height: 256px;*/
}

.dt {
  display: table;
}

.dtc {
  display: table-cell;
}
</style>
