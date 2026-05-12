export interface TConfig {
  childrenToHide: string[];
  subParts: Record<string, string[]>;
  maxLevel: number;
}

export interface TParams {
  input: any;
  config: TConfig;
}
