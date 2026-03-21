import type { ConnectionState } from "./ConnectionState";

export type AppState = {
  readonly startedAt: number;
  readonly ping: {
    readonly ipv4: ConnectionState;
    readonly ipv6: ConnectionState;
  };
  readonly http: {
    readonly ipv4: ConnectionState;
    readonly ipv6: ConnectionState;
  };
  readonly direct: {
    readonly ipv4: ConnectionState;
    readonly ipv6: ConnectionState;
  };
};
