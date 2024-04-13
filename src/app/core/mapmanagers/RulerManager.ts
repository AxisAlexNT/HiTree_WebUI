/* eslint-disable @typescript-eslint/no-unused-vars */
import VectorLayer from "ol/layer/Vector";
import ContigDimensionHolder from "./ContigDimensionHolder";
import {
  HiCViewAndLayersManager,
  LayerResolutionDescriptor,
} from "./HiCViewAndLayersManager";
import VectorSource from "ol/source/Vector";
import { FeatureLoader } from "ol/featureloader";
import { ContactMapManager } from "./ContactMapManager";

class RulerManager {
  private readonly viewAndLayersManager: HiCViewAndLayersManager;
  private readonly contigDimensionHolder: ContigDimensionHolder;

  public constructor(private readonly mapManager: ContactMapManager) {
    this.viewAndLayersManager = mapManager.getLayersManager();
    this.contigDimensionHolder = mapManager.getContigDimensionHolder();
  }

  protected getLoaderFunction(
    resolutionDescriptor: LayerResolutionDescriptor
  ): FeatureLoader {
    const viewAndLayersManager = this.viewAndLayersManager;
    const contigDimensionHolder = this.contigDimensionHolder;
    return function (extent, resolution, projection, success, failure): void {
      console.log("extent", extent);
      //contigDimensionHolder.binToPixel();
    };
  }

  public getHorizontalRulerSource(
    resolutionDescriptor: LayerResolutionDescriptor
  ): VectorSource {
    const source = new VectorSource({
      loader: this.getLoaderFunction(resolutionDescriptor),
    });

    return source;
  }
}

export { RulerManager };
