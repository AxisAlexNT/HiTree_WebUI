/**
 * Interface that is used to signal normalization settings change.
 */
interface NormalizationSettings {
  /**
   * Number which determines whether to apply logarithmic normalization prior to applying Cooler weights.
   * Values that are greater than one mean that this normalization is enabled.
   * Values less than one mean that this normalization is disabled.
   */
  preLogBase: number;
  /**
   * Whether to apply Cooler weights.
   */
  applyCoolerWeights: boolean;
  /**
   * Number which determines whether to apply logarithmic normalization after applying Cooler weights.
   * Values that are greater than one mean that this normalization is enabled.
   * Values less than one mean that this normalization is disabled.
   */
  postLogBase: number;
}

/**
 * Describes current contrast settings.
 */
interface ContrastRangeSettings {
  /**
   * All pixels with values smaller than lower bound will be drawn in background color.
   */
  lowerSignalBound: number;
  /**
   * All pixels with values smaller than lower bound will be drawn in solid color.
   */
  upperSignalBound: number;
}

export { type NormalizationSettings, type ContrastRangeSettings };
