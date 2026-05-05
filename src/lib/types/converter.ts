export interface TConfig {
  childrenToHide: string[];
  subParts: Record<string, string[]>;
  maxLevel: number;
}

export interface TParams {
  inputPath: string;
  configPath: string;
  outputPath: string;
}
