import { CurrentSignalRangeResponse } from "../api/response";
import { InboundDTO } from "./dto";

class CurrentSignalRangeResponseDTO extends InboundDTO<CurrentSignalRangeResponse> {
  public toEntity(): CurrentSignalRangeResponse {
    const minSignalAtLevel: number[] = [];
    Object.entries(this.json.lowerBounds as object).forEach((kv) => {
      const [indexString, value] = kv;
      const indexInt: number = Number.parseInt(indexString);
      if (Number.isFinite(indexInt)) {
        minSignalAtLevel[indexInt] = Number.parseInt(value);
      }
    });
    const maxSignalAtLevel: number[] = [];
    Object.entries(this.json.upperBounds as object).forEach((kv) => {
      const [indexString, value] = kv;
      const indexInt: number = Number.parseInt(indexString);
      if (Number.isFinite(indexInt)) {
        maxSignalAtLevel[indexInt] = Number.parseInt(value);
      }
    });
    return {
      minSignalAtLevel: minSignalAtLevel,
      maxSignalAtLevel: maxSignalAtLevel,
      globalMinSignal: Math.min(
        ...minSignalAtLevel.filter((v) => Number.isFinite(v))
      ),
      globalMaxSignal: Math.max(
        ...maxSignalAtLevel.filter((v) => Number.isFinite(v))
      ),
    };
  }
}

export { CurrentSignalRangeResponseDTO };
