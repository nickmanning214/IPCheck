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
        pipe(
          dispatch({ _tag: "CheckStarted", family: "ipv4" }),
          Effect.zipRight(readConnectionStatus({ family: "ipv4" })),
          Effect.flatMap((result) =>
            dispatch({
              _tag: "CheckCompleted",
              family: "ipv4",
              checkedAt: Date.now(),
              result,
            }),
          ),
          Effect.zipRight(Effect.sleep(Duration.millis(intervalMs))),
          Effect.forever,
        ),
        pipe(
          dispatch({ _tag: "CheckStarted", family: "ipv6" }),
          Effect.zipRight(readConnectionStatus({ family: "ipv6" })),
          Effect.flatMap((result) =>
            dispatch({
              _tag: "CheckCompleted",
              family: "ipv6",
              checkedAt: Date.now(),
              result,
            }),
          ),
          Effect.zipRight(Effect.sleep(Duration.millis(intervalMs))),
          Effect.forever,
        ),
      ],
      { concurrency: "unbounded" },
    ),
  );
