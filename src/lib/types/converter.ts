export interface TConfig {
  hiddenVolumes: string[];
  namedScenes: Record<string, string[]>;
  missingColors: boolean;
  reduceOpacity: boolean;
}

export interface TParams {
  input: any;
  depth?: number;
  config?: TConfig;
}

export interface TTraversable {
  traverse: (cb: (obj: object) => void) => void;
}
