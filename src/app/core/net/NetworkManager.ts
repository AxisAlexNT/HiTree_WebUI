import type { ContactMapManager } from "../mapmanagers/ContactMapManager";
import { RequestManager } from "./api/RequestManager";

class NetworkManager {
  public readonly requestManager: RequestManager;
  constructor(public mapManager?: ContactMapManager) {
    this.requestManager = new RequestManager(this);
  }
}

export { NetworkManager };
