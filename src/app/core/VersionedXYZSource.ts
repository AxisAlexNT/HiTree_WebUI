import XYZ, { type Options as XYZOptions } from "ol/source/XYZ";
import { unref } from "vue";
import { NormalizationType } from "./domain/common";
import type { HiCViewAndLayersManager } from "./mapmanagers/HiCViewAndLayersManager";

class VersionedXYZContactMapSource extends XYZ {
  protected sourceVersion: number;
  protected normalizationType: NormalizationType = NormalizationType.LINEAR;

  constructor(
    protected readonly layersManager: HiCViewAndLayersManager,
    protected readonly zoomLevel: number,
    readonly xyzOptions?: XYZOptions
  ) {
    super(xyzOptions);
    this.sourceVersion = 0;
    this.do_reload();
  }

  public onNormalizationChanged(normalizationType: NormalizationType){
    this.normalizationType = normalizationType;
    this.do_reload();
  }

  /**
   * do_reload
   */
  public do_reload() {
    this.tileCache.expireCache({});
    this.tileCache.clear();
    ++this.sourceVersion;
    this.setTileUrlFunction(this.create_tile_url_function());
    this.changed();
  }

  protected create_tile_url_function() {
    return (coord_zxy: number[]) => {
      const col = coord_zxy[1];
      const row = coord_zxy[2];
      return (
        unref(this.layersManager.mapManager.networkManager.host) +
        "/get_tile?version=" +
        this.sourceVersion +
        "&level=" +
        (1 + this.zoomLevel) +
        "&row=" +
        row +
        "&col=" +
        col +
        "&tile_size=" +
        unref(this.layersManager.tileSize) 
        +
        "&normalization="
        +
        this.normalizationType
      );
    };
  }
}

export { VersionedXYZContactMapSource };
