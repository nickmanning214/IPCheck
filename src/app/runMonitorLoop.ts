import { Duration, Effect, pipe } from "effect";

import type { AppAction } from "../domain/AppAction";
import { ConnectivityService } from "../services/connectivity/ConnectivityService";

const { readConnectionStatus } = Effect.serviceFunctions(ConnectivityService);

export const runMonitorLoop = ({
  dispatch,
  intervalMs = 2000,
}: {
  readonly dispatch: (action: AppAction) => Effect.Effect<void, never, never>;
  readonly intervalMs?: number;
}) =>
  pipe(
    Effect.all(
      [
        { signal: "ping" as const, family: "ipv4" as const },
        { signal: "ping" as const, family: "ipv6" as const },
        { signal: "http" as const, family: "ipv4" as const },
        { signal: "http" as const, family: "ipv6" as const },
        { signal: "direct" as const, family: "ipv4" as const },
        { signal: "direct" as const, family: "ipv6" as const },
      ].map(({ family, signal }) =>
        pipe(
          dispatch({ _tag: "CheckStarted", signal, family }),
          Effect.zipRight(readConnectionStatus({ signal, family })),
          Effect.flatMap((result) =>
            dispatch({
              _tag: "CheckCompleted",
              signal,
              family,
              checkedAt: Date.now(),
              result,
            }),
          ),
          Effect.zipRight(Effect.sleep(Duration.millis(intervalMs))),
          Effect.forever,
        ),
      ),
      { concurrency: "unbounded" },
    ),
  );
