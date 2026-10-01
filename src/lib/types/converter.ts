export interface TConfig {
  missingColors: boolean;
  reduceOpacity: boolean;
  hiddenVolumes: string[];
  namedScenes: Record<string, string[]>;
}

export interface TParams {
  input: any;
  depth?: number;
  config?: TConfig;
  verbose?: boolean;
}

export interface TTraversable {
  traverse: (cb: (obj: object) => void) => void;
}
