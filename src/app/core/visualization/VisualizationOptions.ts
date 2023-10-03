import Colormap from "./colormap/Colormap";

export default class VisualizationOptions {
  public constructor(
    public readonly preLogBase: number,
    public readonly postLogBase: number,
    public readonly applyCoolerWeights: boolean | undefined,
    public readonly resolutionScaling: boolean | undefined,
    public readonly resolutionLinearScaling: boolean | undefined,
    public readonly colormap: Colormap
  ) {}
}
