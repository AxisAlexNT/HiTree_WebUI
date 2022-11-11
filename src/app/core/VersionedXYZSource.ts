import { ImageTile, Tile } from "ol";
import TileState from "ol/TileState";
import XYZ, { type Options as XYZOptions } from "ol/source/XYZ";
import { unref } from "vue";
import type { HiCViewAndLayersManager } from "./mapmanagers/HiCViewAndLayersManager";
import { CurrentSignalRangeResponseDTO } from "./net/dto/responseDTO";

class VersionedXYZContactMapSource extends XYZ {
  protected sourceVersion: number;
  // protected lastResponse?: Record<string, unknown>;

  constructor(
    protected readonly layersManager: HiCViewAndLayersManager,
    protected readonly zoomLevel: number,
    readonly xyzOptions?: XYZOptions
  ) {
    super(xyzOptions);
    this.sourceVersion = 0;
    this.setTileLoadFunction(this.customTileLoadFunction(this));
    this.do_reload();
  }

  /**
   * do_reload
   */
  public do_reload() {
    // this.tileCache.expireCache({});
    // this.tileCache.clear();
    this.clearTileCache();
    ++this.sourceVersion;
    this.setTileUrlFunction(this.create_tile_url_function());
    this.changed();
  }

  public clearTileCache() {
    this.tileCache.expireCache({});
    this.tileCache.clear();
  }

  public customTileLoadFunction(xyzSource: VersionedXYZContactMapSource) {
    return (tile: Tile, src: string) => {
      console.log("CustomTileLoadFunction");
      const xhr = new XMLHttpRequest();
      xhr.responseType = "json";
      const layersManager = this.layersManager;
      xhr.addEventListener("loadend", function (evt) {
        console.log("Got XHR: ", this, "tile was", tile);
        const data = this.response;
        if (
          data !== null &&
          data !== undefined &&
          data.image !== undefined &&
          this.status === 200
        ) {
          console.assert(tile instanceof ImageTile);
          // xyzSource.clearTileCache();
          const imageTile: ImageTile = tile as ImageTile;
          const image: HTMLImageElement =
            imageTile.getImage() as HTMLImageElement;
          console.log("Image was", image);
          image.src = data.image;
          layersManager.callbackFns.contrastSliderRangesCallbacks.forEach(
            (callbackFn) => {
              callbackFn(
                new CurrentSignalRangeResponseDTO(data.ranges).toEntity()
              );
            }
          );
          console.log("Image now", image);
        } else {
          if (this.status >= 400) {
            console.log("Error: Tile load status >= 400 for", tile);
            // tile.setState(TileState.ERROR);
          }
          // eslint-disable-next-line no-self-assign
          // image.src = image.src;
          // imageTile.setImage(image);
        }
        console.log(
          "XHR now: ",
          this,
          "tile now",
          tile,
          "tilee.image now",
          (tile as ImageTile).getImage()
        );
      });
      xhr.addEventListener("error", function () {
        console.log("onError listener xhr", this);
        if (this.status >= 400) {
          console.log("onError listener xhr: set Error", this);
          // tile.setState(TileState.ERROR);
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

  // public getTile(
  //   z: number,
  //   x: number,
  //   y: number,
  //   pixelRatio: number,
  //   projection: Projection
  // ): ImageTile | ReprojTile {
  //   this.layersManager.callbackFns.contrastSliderCallbacks.forEach(
  //     (fnCallback) => {
  //       console.log(
  //         "Calling callbackFn: ",
  //         fnCallback,
  //         " with tile version ",
  //         this.sourceVersion
  //       );
  //       fnCallback(this.sourceVersion);
  //     }
  //   );
  //   return super.getTile(z, x, y, pixelRatio, projection);
  // }
}

export { VersionedXYZContactMapSource };
