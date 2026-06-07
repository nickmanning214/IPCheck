import { Duration, Effect, pipe } from "effect";

import type { AppAction } from "../domain/AppAction";
import { ConnectivityService } from "../services/connectivity/ConnectivityService";

export const runMonitorLoop = ({
  dispatch,
  intervalMs = 1000,
}: {
  readonly dispatch: (action: AppAction) => Effect.Effect<void, never, never>;
  readonly intervalMs?: number;
}) =>
  pipe(
    ConnectivityService,
    Effect.flatMap(({ readConnectionStatus, readSiteStatus }) =>
      Effect.all(
        [
          ...[
            { signal: "ping" as const, family: "ipv4" as const },
            { signal: "ping" as const, family: "ipv6" as const },
            { signal: "http" as const, family: "ipv4" as const },
            { signal: "http" as const, family: "ipv6" as const },
            { signal: "direct" as const, family: "ipv4" as const },
            { signal: "direct" as const, family: "ipv6" as const },
          ].map(({ family, signal }) =>
            pipe(
              dispatch({ _tag: "CheckStarted", signal, family }),
              Effect.andThen(readConnectionStatus({ signal, family })),
              Effect.flatMap((result) =>
                dispatch({
                  _tag: "CheckCompleted",
                  signal,
                  family,
                  checkedAt: Date.now(),
                  result,
                }),
              ),
              Effect.andThen(Effect.sleep(Duration.millis(intervalMs))),
              Effect.forever,
            ),
          ),
          ...["plaintextsports" as const, "slack" as const].map((site) =>
            pipe(
              dispatch({ _tag: "SiteCheckStarted", site }),
              Effect.andThen(readSiteStatus({ site })),
              Effect.flatMap((result) =>
                dispatch({
                  _tag: "SiteCheckCompleted",
                  site,
                  checkedAt: Date.now(),
                  result,
                }),
              ),
              Effect.andThen(Effect.sleep(Duration.millis(intervalMs))),
              Effect.forever,
            ),
          ),
        ],
        { concurrency: "unbounded" },
      ),
    ),
  );
