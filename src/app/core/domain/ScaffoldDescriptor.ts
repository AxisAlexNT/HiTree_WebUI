interface ScaffoldDescriptor {
  scaffoldId: number;
  scaffoldName: string;
  spacerLength: number;
  scaffoldBordersBP: ScaffoldBordersBP | null;
}

interface ScaffoldBordersBP {
  startBP: number;
  endBP: number;
}

export { type ScaffoldDescriptor, type ScaffoldBordersBP };
