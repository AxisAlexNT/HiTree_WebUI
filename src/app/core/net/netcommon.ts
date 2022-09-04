import type { AssemblyInfo } from "../domain/AssemblyInfo";

interface OpenFileResponse {
  status: string;
  dtype: string;
  resolutions: number[];
  pixelResolutions: number[];
  tileSize: number;
  assemblyInfo: AssemblyInfo;
  matrixSizesBins: number[];
}

export { type OpenFileResponse };
