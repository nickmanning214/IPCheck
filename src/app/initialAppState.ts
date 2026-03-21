import type { AppState } from "../domain/AppState";

const initialConnectionState = ({ detail }: { readonly detail: string }) => ({
  status: "unknown" as const,
  isChecking: false,
  detail,
  lastCheckedAt: null,
  successfulChecks: 0,
  totalChecks: 0,
  latencyHistoryMs: [],
  recentChecks: [],
});

export const makeInitialAppState = ({
  startedAt,
}: {
  readonly startedAt: number;
}) =>
  ({
    startedAt,
    ping: {
      ipv4: initialConnectionState({
        detail: "Waiting for the first IPv4 ping check",
      }),
      ipv6: initialConnectionState({
        detail: "Waiting for the first IPv6 ping check",
      }),
    },
    http: {
      ipv4: initialConnectionState({
        detail: "Waiting for the first IPv4 HTTP check",
      }),
      ipv6: initialConnectionState({
        detail: "Waiting for the first IPv6 HTTP check",
      }),
    },
    direct: {
      ipv4: initialConnectionState({
        detail: "Waiting for the first IPv4 direct HTTPS check",
      }),
      ipv6: initialConnectionState({
        detail: "Waiting for the first IPv6 direct HTTPS check",
      }),
    },
  }) satisfies AppState;

export const initialAppState = makeInitialAppState({ startedAt: 0 });
