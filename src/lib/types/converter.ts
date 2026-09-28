export interface TConfig {
  hidden: string[];
  subparts: Record<string, string[]>;
}

export interface TParams {
  input: any;
  depth?: number;
  config?: TConfig | null;
}

export interface TTraversable {
  traverse: (cb: (obj: object) => void) => void;
}
