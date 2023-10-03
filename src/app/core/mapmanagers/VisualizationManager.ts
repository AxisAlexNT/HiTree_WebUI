import {
  GetVisualizationOptionsRequest,
  SetVisualizationOptionsRequest,
} from "../net/api/request";
import { ContactMapManager } from "./ContactMapManager";
import { useVisualizationOptionsStore } from "@/app/stores/visualizationOptionsStore";
import VisualizationOptions from "../visualization/VisualizationOptions";

class VisualizationManager {
  public readonly visualizationOptionsStore = useVisualizationOptionsStore();
  public constructor(public readonly mapManager: ContactMapManager) {}

  public fetchVisualizationOptions(): Promise<VisualizationOptions> {
    return this.mapManager.networkManager.requestManager
      .getVisualizationOptions(new GetVisualizationOptionsRequest({}))
      .then((options) => {
        this.visualizationOptionsStore.setVisualizationOptions(options);
        return options;
      });
  }

  public sendVisualizationOptionsToServer(): Promise<VisualizationOptions> {
    return this.mapManager.networkManager.requestManager
      .setVisualizationOptions(
        new SetVisualizationOptionsRequest({
          options: this.visualizationOptionsStore.asVisualizationOptions(),
        })
      )
      .then((options) => {
        this.visualizationOptionsStore.setVisualizationOptions(options);
        return options;
      });
  }
}

export { VisualizationManager };
