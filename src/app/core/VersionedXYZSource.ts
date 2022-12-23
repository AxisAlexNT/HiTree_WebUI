import { ImageTile } from "ol";
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
    this.setTileLoadFunction((tile, src) => {
      console.assert(tile instanceof ImageTile);
      const imageTile: ImageTile = tile as ImageTile;
      const image: HTMLImageElement | HTMLVideoElement =
        imageTile.getImage() as HTMLImageElement | HTMLVideoElement;
      const xhr = new XMLHttpRequest();
      xhr.responseType = "json";
      xhr.addEventListener("loadend", function (evt) {
        // console.log("Got XHR Response: ", this.response);
        const data = this.response;
        if (data && data.image) {
          // image.src = URL.createObjectURL(data.image);
          // image.src = "data:image/png;base64," + data.image;
          image.src = data.image;
          tile.setState(TileState.LOADED);
          // @ts-expect-error Adding field to object is ok in JS but not in TS
          tile.lastResponse = data;
          layersManager.callbackFns.contrastSliderRangesCallbacks.forEach(
            (callbackFn) => {
              callbackFn(
                new CurrentSignalRangeResponseDTO(data.ranges).toEntity()
              );
            }
          );
        } else /* if (this.status >= 400) */ {
          // @ts-expect-error If tile was loaded successfully at least once, last response is saved
          if (tile.lastResponse) {
            // @ts-expect-error If tile was loaded successfully at least once, last response is saved
            image.src = tile.lastResponse.image;
          } else {
            tile.setState(TileState.ERROR); // tile.setState(TileState.EMPTY);
          }
        }
      });
      xhr.addEventListener("error", function () {
        // @ts-expect-error If tile was loaded successfully at least once, last response is saved
        if (tile.lastResponse) {
          // @ts-expect-error If tile was loaded successfully at least once, last response is saved
          image.src = tile.lastResponse.image;
        } else {
          tile.setState(TileState.ERROR);
        }
      });
      xhr.open("GET", src);
      xhr.send();
    });
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
