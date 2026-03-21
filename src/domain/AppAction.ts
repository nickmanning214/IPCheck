import type { ConnectivitySnapshot } from "./ConnectivitySnapshot";

export type AppAction =
  | { readonly _tag: "CheckStarted" }
  | {
      readonly _tag: "SnapshotUpdated";
      readonly snapshot: ConnectivitySnapshot;
    };
