import type { AssemblyInfo } from "../../domain/AssemblyInfo";
import {
  ContigDirection,
  ContigHideType,
  QueryLengthUnit,
} from "../../domain/common";
import type { ContigDescriptor } from "../../domain/ContigDescriptor";
import type {
  ScaffoldBordersBP,
  ScaffoldDescriptor,
} from "../../domain/ScaffoldDescriptor";
import type { LoadBedTrackResponse, OpenFileResponse } from "../netcommon";

abstract class InboundDTO<T> {
  constructor(public readonly json: Record<string, unknown>) {}

  public abstract toEntity(): T;
}

abstract class OutboundDTO<T> {
  constructor(public readonly entity: T) {}

  abstract toDTO(): Record<string, unknown>;
}

function queryLengthUnitFromDTO(dto: number): QueryLengthUnit {
  const queryLengthUnits = [
    QueryLengthUnit.BASE_PAIRS,
    QueryLengthUnit.BINS,
    QueryLengthUnit.PIXELS,
  ];
  return queryLengthUnits[dto];
}

function contigDirectionFromDTO(dto: number): ContigDirection {
  const contigDirections = [ContigDirection.REVERSED, ContigDirection.FORWARD];
  return contigDirections[dto];
}

function contigHideTypeFromDTO(dto: number): ContigHideType {
  const contigHideTypes = [
    ContigHideType.AUTO_HIDDEN,
    ContigHideType.AUTO_SHOWN,
    ContigHideType.FORCED_HIDDEN,
    ContigHideType.FORCED_SHOWN,
  ];
  return contigHideTypes[dto];
}

class ContigDescriptorDTO extends InboundDTO<ContigDescriptor> {
  public toEntity(): ContigDescriptor {
    return {
      contigId: this.json.contigId as number,
      contigName: this.json.contigName as string,
      contigLengthBp: this.json.contigLengthBp as number,
      contigLengthBins: new Map(
        Array.from(
          Object.entries(this.json.contigLengthBins as Record<number, number>)
        ).map(([resolution, lengthBins]) => {
          return [Number(resolution), Number(lengthBins)];
        })
      ),
      direction: contigDirectionFromDTO(this.json.contigDirection as number),
      presenceAtResolution: new Map(
        Array.from(
          Object.entries(
            this.json.contigPresenceAtResolution as Record<number, number>
          )
        ).map(([resolution, chtIndex]) => [
          Number(resolution),
          contigHideTypeFromDTO(chtIndex),
        ])
      ),
    };
  }
}

class ScaffoldBordersBPDTO extends InboundDTO<ScaffoldBordersBP> {
  public toEntity(): ScaffoldBordersBP {
    return {
      startBP: this.json.startBP as number,
      endBP: this.json.endBP as number,
    };
  }
}

class ScaffoldDescriptorDTO extends InboundDTO<ScaffoldDescriptor> {
  public toEntity(): ScaffoldDescriptor {
    return {
      scaffoldId: this.json.scaffoldId as number,
      scaffoldName: this.json.scaffoldName as string,
      spacerLength: this.json.spacerLength as number,
      scaffoldBordersBP: this.json.scaffoldBordersBP
        ? new ScaffoldBordersBPDTO(
            this.json.scaffoldBordersBP as Record<string, unknown>
          ).toEntity()
        : null,
    };
  }
}

class AssemblyInfoDTO extends InboundDTO<AssemblyInfo> {
  public toEntity(): AssemblyInfo {
    return {
      contigDescriptors: (
        this.json.contigDescriptors as Record<string, unknown>[]
      ).map((cd) => new ContigDescriptorDTO(cd).toEntity()),
      scaffoldDescriptors: (
        this.json.scaffoldDescriptors as Record<string, unknown>[]
      ).map((sd) => new ScaffoldDescriptorDTO(sd).toEntity()),
    };
  }
}

class OpenFileResponseDTO extends InboundDTO<OpenFileResponse> {
  public toEntity(): OpenFileResponse {
    return {
      status: this.json.status as string,
      dtype: this.json.dtype as string,
      resolutions: this.json.resolutions as number[],
      pixelResolutions: this.json.pixelResolutions as number[],
      tileSize: this.json.tileSize as number,
      assemblyInfo: new AssemblyInfoDTO(
        this.json.assemblyInfo as Record<string, unknown>
      ).toEntity(),
      matrixSizesBins: this.json.matrixSizesBins as number[],
    };
  }
}

class LoadBedTrackResponseDTO extends InboundDTO<LoadBedTrackResponse> {
  public toEntity(): LoadBedTrackResponse {
    return {
      tracks: this.json.toString().split(/(\s*\r\n|\r|\n)\s*,\s*/).filter((line) => ! /^\s*$/.test(line)),
    };
  }
}

export {
  InboundDTO,
  OutboundDTO,
  ContigDescriptorDTO,
  ScaffoldBordersBPDTO,
  ScaffoldDescriptorDTO,
  AssemblyInfoDTO,
  OpenFileResponseDTO,
  LoadBedTrackResponseDTO,
  queryLengthUnitFromDTO,
  contigDirectionFromDTO,
  contigHideTypeFromDTO,
};
