import Colormap from "./Colormap";

export default class SimpleLinearGradient extends Colormap {
  public constructor(
    public readonly startColorRGBAString: string,
    public readonly endColorRGBAString: string,
    public readonly minSignal: number,
    public readonly maxSignal: number
  ) {
    super("SimpleLinearGradient");
  }
}
