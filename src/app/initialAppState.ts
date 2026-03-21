import type { AppState } from "../domain/AppState";

export const makeInitialAppState = ({
  startedAt,
}: {
  readonly startedAt: number;
}) =>
  ({
    startedAt,
    ipv4: {
      status: "unknown",
      isChecking: false,
      detail: "Waiting for the first IPv4 check",
      lastCheckedAt: null,
      successfulChecks: 0,
      totalChecks: 0,
    },
    ipv6: {
      status: "unknown",
      isChecking: false,
      detail: "Waiting for the first IPv6 check",
      lastCheckedAt: null,
      successfulChecks: 0,
      totalChecks: 0,
    },
  }) satisfies AppState;

export const initialAppState = makeInitialAppState({ startedAt: 0 });
