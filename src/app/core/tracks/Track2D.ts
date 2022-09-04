type track2DBorders = [[number, number], [number, number]];

interface Track2DDescriptor {
  bordersBp: track2DBorders[];
  names: string[];
}

interface Track2DOptions {
  color?: string;
  width?: number;
}

abstract class Track2D {
  public abstract recalculateBorders(): void;
}

export {
  Track2D,
  type Track2DDescriptor,
  type Track2DOptions,
  type track2DBorders,
};
