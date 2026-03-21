import { Match, pipe } from "effect";

import type { AppAction } from "../domain/AppAction";
import type { AppState } from "../domain/AppState";

const checkingStatus = "checking";

export const appReducer = (state: AppState, action: AppAction) =>
  pipe(
    Match.value(action),
    Match.when({ _tag: "CheckStarted" }, () =>
      pipe(
        state,
        (current): AppState => ({
          ...current,
          ipv4: {
            ...current.ipv4,
            status: checkingStatus,
          },
          ipv6: {
            ...current.ipv6,
            status: checkingStatus,
          },
        }),
      ),
    ),
    Match.when({ _tag: "SnapshotUpdated" }, ({ snapshot }) => snapshot),
    Match.exhaustive,
  );
