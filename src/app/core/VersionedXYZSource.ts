import { ImageTile, Tile } from "ol";
import TileState from "ol/TileState";
import XYZ, { type Options as XYZOptions } from "ol/source/XYZ";
import { unref } from "vue";
import type { HiCViewAndLayersManager } from "./mapmanagers/HiCViewAndLayersManager";
import { CurrentSignalRangeResponseDTO } from "./net/dto/responseDTO";

class VersionedXYZContactMapSource extends XYZ {
  protected sourceVersion: number;
  
  constructor(
    protected readonly layersManager: HiCViewAndLayersManager,
    protected readonly zoomLevel: number,
    readonly xyzOptions?: XYZOptions
  ) {
    super(xyzOptions);
    this.sourceVersion = 0;
    this.isCachingEnabled = false;
    this.tileImageSrcCache = new Map();
    this.setTileLoadFunction(this.customTileLoadFunction(this));
    this.do_reload();
  }

  /**
   * do_reload
   */
  public do_reload() {
    this.clearTileCache(true);
    ++this.sourceVersion;
    this.setTileUrlFunction(this.create_tile_url_function());
    this.changed();
  }

  public clearTileCache(clearHashMap?: boolean | undefined | null) {
    this.tileCache.expireCache({});
    this.tileCache.clear();
    if (clearHashMap && this.isCachingEnabled) {
      this.tileImageSrcCache.clear();
    }
  }

  public customTileLoadFunction(xyzSource: VersionedXYZContactMapSource) {
    const layersManager = this.layersManager;
    return (tile: Tile, src: string) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = "json";
      xhr.addEventListener("loadend", function () {
        const data = this.response;
        if (data !== undefined && data.image !== undefined) {
          // image.src = URL.createObjectURL(data.image);
          // image.src = "data:image/png;base64," + data.image;
          //this.lastResponse = this.response;
          tile["lastResponse"] = data;
          image.src = data.image;
          if (xyzSource.isCachingEnabled) {
            xyzSource.tileImageSrcCache.set(
              tile.getTileCoord().toString(),
              image.src
            );
          }
          layersManager.callbackFns.contrastSliderRangesCallbacks.forEach(
            (callbackFn) => {
              callbackFn(
                new CurrentSignalRangeResponseDTO(data.ranges).toEntity()
              );
            }
          );
        } else if (this.status >= 400) {
          tile.setState(TileState.ERROR);
        } else {
          image.src = tile["lastResponse"].image;
        }
      });
      xhr.addEventListener("error", function () {
        if (this.status >= 400) {
          tile.setState(TileState.ERROR);
        }
      });
      xhr.open("GET", src);
      xhr.send();
    };
  }

  protected create_tile_url_function() {
    return (coord_zxy: number[]) => {
      const col = coord_zxy[1];
      const row = coord_zxy[2];
      return (
        `${unref(this.layersManager.mapManager.networkManager.host)}` +
        `/get_tile?version=${this.sourceVersion}` +
        `&level=${1 + this.zoomLevel}` +
        `&row=${row}` +
        `&col=${col}` +
        `&tile_size=${unref(this.layersManager.tileSize)}`
      );
    };
  }
}

export { VersionedXYZContactMapSource };
