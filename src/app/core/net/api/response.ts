class CurrentSignalRangeResponse {
  public constructor(
    public readonly minSignalAtLevel: number[],
    public readonly maxSignalAtLevel: number[],
    public readonly globalMinSignal: number,
    public readonly globalMaxSignal: number
  ) {}
}

export { CurrentSignalRangeResponse };
