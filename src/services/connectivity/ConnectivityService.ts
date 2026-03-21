import type { Effect as Fx } from "effect";
import { Context, Effect, Layer, pipe } from "effect";

import type { CheckResult } from "../../domain/CheckResult";
import type { Family } from "../../domain/Family";
import { ProcessService } from "../process/ProcessService";
import { readConnectionStatus } from "./readConnectionStatus";

export class ConnectivityService extends Context.Tag("ConnectivityService")<
  ConnectivityService,
  {
    readonly readConnectionStatus: (input: {
      readonly family: Family;
    }) => Fx.Effect<CheckResult>;
  }
>() {
  static Live = Layer.effect(
    ConnectivityService,
    pipe(
      ProcessService,
      Effect.map((processService) => ({
        readConnectionStatus: ({ family }: { readonly family: Family }) =>
          pipe(
            readConnectionStatus({ family }),
            Effect.provideService(ProcessService, processService),
          ),
      })),
    ),
  );
}
