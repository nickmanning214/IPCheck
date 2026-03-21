import type { Effect as Fx } from "effect";
import { Context, Effect, Layer, pipe } from "effect";

import type { CheckResult } from "../../domain/CheckResult";
import type { Family } from "../../domain/Family";
import type { ProbeTargets } from "../../domain/ProbeTargets";
import { ProcessService } from "../process/ProcessService";
import { readConnectionStatus } from "./readConnectionStatus";
import { readProbeTargets } from "./readProbeTargets";

export class ConnectivityService extends Context.Tag("ConnectivityService")<
  ConnectivityService,
  {
    readonly targets: ProbeTargets;
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
        targets: readProbeTargets(Bun.env),
        readConnectionStatus: ({ family }: { readonly family: Family }) =>
          pipe(
            readConnectionStatus({
              family,
              target: readProbeTargets(Bun.env)[family],
            }),
            Effect.provideService(ProcessService, processService),
          ),
      })),
    ),
  );
}
