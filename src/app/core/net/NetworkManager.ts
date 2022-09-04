import type { ContactMapManager } from "../mapmanagers/ContactMapManager";
import { RequestManager } from "./api/RequestManager";

class NetworkManager {
  public readonly requestManager: RequestManager;
  constructor(public host: string, public mapManager?: ContactMapManager) {
    this.requestManager = new RequestManager(this);
  }

  public onHostChanged(newHost: string): void {
    this.host = newHost;
  }
}

export { NetworkManager };
