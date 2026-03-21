import { Duration, Effect, pipe } from "effect";

import type { AppAction } from "../domain/AppAction";
import { ConnectivityService } from "../services/connectivity/ConnectivityService";

const { readSnapshot } = Effect.serviceFunctions(ConnectivityService);

export const runMonitorLoop = ({
  dispatch,
  intervalMs = 5000,
}: {
  readonly dispatch: (action: AppAction) => Effect.Effect<void, never, never>;
  readonly intervalMs?: number;
}) =>
  pipe(
    dispatch({ _tag: "CheckStarted" }),
    Effect.zipRight(readSnapshot()),
    Effect.flatMap((snapshot) =>
      dispatch({
        _tag: "SnapshotUpdated",
        snapshot,
      }),
    ),
    Effect.zipRight(Effect.sleep(Duration.millis(intervalMs))),
    Effect.forever,
  );
