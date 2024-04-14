import { ColorTranslator } from "colortranslator";
import Colormap from "./Colormap";

export default class SimpleLinearGradient extends Colormap {
  public constructor(
    public readonly startColorRGBA: ColorTranslator,
    public readonly endColorRGBA: ColorTranslator,
    public readonly minSignal: number,
    public readonly maxSignal: number
  ) {
    super("SimpleLinearGradient");
  }
}
