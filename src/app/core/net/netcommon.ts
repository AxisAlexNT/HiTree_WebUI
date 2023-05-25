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

interface LoadBedTrackResponse {
  tracks: string[];
}

export { type OpenFileResponse, LoadBedTrackResponse };
