import { ImageTile, Tile } from "ol";
import TileState from "ol/TileState";
import XYZ, { type Options as XYZOptions } from "ol/source/XYZ";
import { unref } from "vue";
import type { HiCViewAndLayersManager } from "./mapmanagers/HiCViewAndLayersManager";
import { CurrentSignalRangeResponseDTO } from "./net/dto/responseDTO";

class VersionedXYZContactMapSource extends XYZ {
  protected sourceVersion: number;
  // protected lastResponse?: Record<string, unknown>;
  protected tileImageSrcCache: Map<string, string>;
  protected isCachingEnabled: boolean;

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

        const imageTile: ImageTile = tile as ImageTile;
        const image: HTMLImageElement =
          imageTile.getImage() as HTMLImageElement;

        if (
          data !== null &&
          data !== undefined &&
          data.image !== undefined &&
          this.status === 200
        ) {
          console.assert(tile instanceof ImageTile);
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
          tile.setState(TileState.LOADED);
        } else {
          if (this.status >= 400) {
            console.log("Error: Tile load status >= 400 for", tile);
            // tile.setState(TileState.ERROR);
            tile.setState(TileState.EMPTY);
            return;
          }
          if (xyzSource.isCachingEnabled) {
            const oldImageSrc = xyzSource.tileImageSrcCache.get(
              tile.getTileCoord().toString()
            );
            if (oldImageSrc) {
              image.src = oldImageSrc;
              tile.setState(TileState.LOADED);
              return;
            }
          }
          tile.setState(TileState.EMPTY);
          return;
        }
      });
      xhr.addEventListener("error", function () {
        console.log("onError listener xhr", this);
        if (this.status >= 400) {
          console.log("onError listener xhr: set Error", this);
          // tile.setState(TileState.ERROR);
        }
      });
      xhr.addEventListener("loadstart", () => {
        tile.setState(TileState.LOADING);
      });
      xhr.addEventListener("abort", () => {
        tile.setState(TileState.EMPTY);
        console.log("xhr request was aborted: ", this);
        const oldImageSrc = xyzSource.tileImageSrcCache.get(
          tile.getTileCoord().toString()
        );
        if (oldImageSrc) {
          ((tile as ImageTile).getImage() as HTMLImageElement).src =
            oldImageSrc;
        } else {
          throw new Error(
            "Image source is not found in cache for " +
              tile.getTileCoord().toString()
          );
        }
        tile.setState(TileState.LOADED);
      });
      xhr.addEventListener("timeout", () => {
        tile.setState(TileState.EMPTY);
        console.log("xhr request was timed out: ", this);
        const oldImageSrc = xyzSource.tileImageSrcCache.get(
          tile.getTileCoord().toString()
        );
        if (oldImageSrc) {
          ((tile as ImageTile).getImage() as HTMLImageElement).src =
            oldImageSrc;
        } else {
          throw new Error(
            "Image source is not found in cache for " +
              tile.getTileCoord().toString()
          );
        }
        tile.setState(TileState.LOADED);
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
