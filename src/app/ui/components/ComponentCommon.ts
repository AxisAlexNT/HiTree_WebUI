import path from "path-browserify";

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

function extensionToDataType(
  ext: string
): "hict" | "agp" | "fasta" | "experiment" | undefined {
  const extMap: Record<string, "hict" | "agp" | "fasta" | "experiment"> = {
    hict: "hict",
    "hict.hdf5": "hict",
    hdf5: "hict",
    agp: "agp",
    fasta: "fasta",
    hictexp: "experiment",
  };
  const extLower = ext.toLowerCase().substring(1);
  // console.log("extLower = ", extLower);
  if (extLower in extMap) {
    return extMap[extLower];
  } else {
    return undefined;
  }
}

interface FileTreeNode {
  nodeName: string;
  nodeType: "file" | "directory";
  dataType?: "hict" | "agp" | "fasta" | "experiment";
  nodePath: string;
  children: FileTreeNode[];
  originalIndex?: number;
}

export {
  type NormalizationSettings,
  type ContrastRangeSettings,
  type FileTreeNode,
  extensionToDataType,
};
