import type { ContigDescriptor } from "./ContigDescriptor";
import type { ScaffoldDescriptor } from "./ScaffoldDescriptor";

interface AssemblyInfo {
  contigDescriptors: ContigDescriptor[];
  scaffoldDescriptors: ScaffoldDescriptor[];
}

export { type AssemblyInfo };
