import type { ConnectionState } from "./ConnectionState";

export type AppState = {
  readonly startedAt: number;
  readonly ipv4: ConnectionState;
  readonly ipv6: ConnectionState;
};
