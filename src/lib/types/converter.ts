export interface TConfig {
  hidden: string[];
  subparts: Record<string, string[]>;
  depth: number;
}

export interface TParams {
  input: any;
  config?: TConfig | null;
}

export interface TTraversable {
  traverse: (cb: (obj: object) => void) => void;
}
