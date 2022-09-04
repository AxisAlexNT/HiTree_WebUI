import {
  ListFilesRequest,
  OpenFileRequest,
  CloseFileRequest,
  GetFastaForAssemblyRequest,
  type HiCTAPIRequest,
  GroupContigsIntoScaffoldRequest,
  UngroupContigsFromScaffoldRequest,
  ReverseSelectionRangeRequest,
  ListFASTAFilesRequest,
  LinkFASTARequest,
  MoveSelectionRangeRequest,
  ListAGPFilesRequest,
  LoadAGPRequest,
  GetFastaForSelectionRequest,
} from "../api/request";
import { OutboundDTO } from "./dto";

abstract class HiCTAPIRequestDTO<
  T extends HiCTAPIRequest
> extends OutboundDTO<T> {
  public readonly requestPath: string;

  public constructor(entity: T) {
    super(entity);
    this.requestPath = entity.requestPath;
  }

  static toDTOClass(entity: HiCTAPIRequest) {
    switch (true) {
      case entity instanceof ReverseSelectionRangeRequest:
        return new ReverseSelectionRangeRequestDTO(
          entity as ReverseSelectionRangeRequest
        );
      case entity instanceof MoveSelectionRangeRequest:
        return new MoveSelectionRangeRequestDTO(
          entity as MoveSelectionRangeRequest
        );
      case entity instanceof GroupContigsIntoScaffoldRequest:
        return new GroupContigsIntoScaffoldRequestDTO(
          entity as GroupContigsIntoScaffoldRequest
        );
      case entity instanceof UngroupContigsFromScaffoldRequest:
        return new UngroupContigsFromScaffoldRequestDTO(
          entity as UngroupContigsFromScaffoldRequest
        );
      case entity instanceof OpenFileRequest:
        return new OpenFileRequestDTO(entity as OpenFileRequest);
      case entity instanceof ListFilesRequest:
        return new ListFilesRequestDTO(entity);
      case entity instanceof ListFASTAFilesRequest:
        return new ListFASTAFilesRequestDTO(entity);
      case entity instanceof LinkFASTARequest:
        return new LinkFASTARequestDTO(entity as LinkFASTARequest);
      case entity instanceof ListAGPFilesRequest:
        return new ListAGPFilesRequestDTO(entity);
      case entity instanceof LoadAGPRequest:
        return new LoadAGPRequestDTO(entity as LoadAGPRequest);
      case entity instanceof CloseFileRequest:
        return new CloseFileRequestDTO(entity as CloseFileRequest);
      case entity instanceof GetFastaForAssemblyRequest:
        return new GetFastaForAssemblyRequestDTO(
          entity as GetFastaForAssemblyRequest
        );
      case entity instanceof GetFastaForSelectionRequest:
        return new GetFastaForSelectionRequestDTO(
          entity as GetFastaForSelectionRequest
        );
      default:
        throw new Error(
          `Unknown HiCTAPIRequest type: ${typeof entity}, constructor ${
            entity.constructor
          } cannot be transformed to DTO class.`
        );
    }
  }
}

class ReverseSelectionRangeRequestDTO extends HiCTAPIRequestDTO<ReverseSelectionRangeRequest> {
  toDTO(): Record<string, unknown> {
    return {
      startContigId: this.entity.options.startContigId,
      endContigId: this.entity.options.endContigId,
    };
  }
}

class MoveSelectionRangeRequestDTO extends HiCTAPIRequestDTO<MoveSelectionRangeRequest> {
  toDTO(): Record<string, unknown> {
    return {
      startContigId: this.entity.options.startContigId,
      endContigId: this.entity.options.endContigId,
      targetStartOrder: this.entity.options.targetStartOrder,
    };
  }
}

class OpenFileRequestDTO extends HiCTAPIRequestDTO<OpenFileRequest> {
  toDTO(): Record<string, unknown> {
    return {
      filename: this.entity.options.filename,
      fastaFilename: this.entity.options.fastaFilename,
    };
  }
}
class LinkFASTARequestDTO extends HiCTAPIRequestDTO<LinkFASTARequest> {
  toDTO(): Record<string, unknown> {
    return {
      fastaFilename: this.entity.options.fastaFilename,
    };
  }
}
class LoadAGPRequestDTO extends HiCTAPIRequestDTO<LoadAGPRequest> {
  toDTO(): Record<string, unknown> {
    return {
      agpFilename: this.entity.options.agpFilename,
    };
  }
}

class GroupContigsIntoScaffoldRequestDTO extends HiCTAPIRequestDTO<GroupContigsIntoScaffoldRequest> {
  toDTO(): Record<string, unknown> {
    return {
      startContigId: this.entity.options.startContigId,
      endContigId: this.entity.options.endContigId,
      scaffoldName: this.entity.options.newScaffoldName,
      spacerLength: this.entity.options.spacerLength,
    };
  }
}

class UngroupContigsFromScaffoldRequestDTO extends HiCTAPIRequestDTO<UngroupContigsFromScaffoldRequest> {
  toDTO(): Record<string, unknown> {
    return {
      startContigId: this.entity.options.startContigId,
      endContigId: this.entity.options.endContigId,
    };
  }
}

class ListFilesRequestDTO extends HiCTAPIRequestDTO<ListFilesRequest> {
  toDTO(): Record<string, unknown> {
    return {};
  }
}

class ListFASTAFilesRequestDTO extends HiCTAPIRequestDTO<ListFASTAFilesRequest> {
  toDTO(): Record<string, unknown> {
    return {};
  }
}
class ListAGPFilesRequestDTO extends HiCTAPIRequestDTO<ListAGPFilesRequest> {
  toDTO(): Record<string, unknown> {
    return {};
  }
}

class CloseFileRequestDTO extends HiCTAPIRequestDTO<CloseFileRequest> {
  toDTO(): Record<string, unknown> {
    return {};
  }
}

class GetFastaForAssemblyRequestDTO extends HiCTAPIRequestDTO<GetFastaForAssemblyRequest> {
  toDTO(): Record<string, unknown> {
    return {};
  }
}

class GetFastaForSelectionRequestDTO extends HiCTAPIRequestDTO<GetFastaForSelectionRequest> {
  toDTO(): Record<string, unknown> {
    return {
      fromBpX: this.entity.options.fromBpX,
      fromBpY: this.entity.options.fromBpY,
      toBpX: this.entity.options.toBpX,
      toBpY: this.entity.options.toBpY,
    };
  }
}

export {
  HiCTAPIRequestDTO,
  OpenFileRequestDTO,
  ListFilesRequestDTO,
  CloseFileRequestDTO,
  GetFastaForAssemblyRequestDTO,
  GroupContigsIntoScaffoldRequestDTO,
  UngroupContigsFromScaffoldRequestDTO,
  ReverseSelectionRangeRequestDTO,
};
