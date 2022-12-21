import { ImageTile } from "ol";
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
          //this.lastResponse = this.response;
          tile["lastResponse"] = data;
          image.src = data.image;
          // console.log("Data.ranges is ", data.ranges);
          // console.log(
          //   "Constructed ranges DTO: ",
          //   new CurrentSignalRangeResponseDTO(data.ranges)
          // );
          // console.log(
          //   "Constructed ranges entity: ",
          //   new CurrentSignalRangeResponseDTO(data.ranges).toEntity()
          // );
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
