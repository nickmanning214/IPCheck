import type { Effect as Fx } from "effect";
import { Context, Effect, Layer, pipe } from "effect";

import type { ConnectivitySnapshot } from "../../domain/ConnectivitySnapshot";
import { ProcessService } from "../process/ProcessService";
import { readConnectivitySnapshot } from "./readConnectivitySnapshot";

export class ConnectivityService extends Context.Tag("ConnectivityService")<
  ConnectivityService,
  {
    readonly readSnapshot: () => Fx.Effect<ConnectivitySnapshot>;
  }
>() {
  static Live = Layer.effect(
    ConnectivityService,
    pipe(
      ProcessService,
      Effect.map((processService) => ({
        readSnapshot: () =>
          pipe(
            readConnectivitySnapshot(),
            Effect.provideService(ProcessService, processService),
          ),
      })),
    ),
  );
}
