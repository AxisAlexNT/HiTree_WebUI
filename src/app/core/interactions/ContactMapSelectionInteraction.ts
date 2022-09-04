import { Extent } from "ol/interaction";
import type { Options } from "ol/interaction/Extent";

class ContactMapSelectionInteraction extends Extent {
  public constructor(opt_options?: Options) {
    super(opt_options);
  }
}

export { ContactMapSelectionInteraction };
