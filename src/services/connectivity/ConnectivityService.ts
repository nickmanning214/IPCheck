import type { Effect as Fx } from "effect";
import { Context, Effect, Layer, pipe } from "effect";

import type { CheckResult } from "../../domain/CheckResult";
import type { Family } from "../../domain/Family";
import type { ProbeTargets } from "../../domain/ProbeTargets";
import type { Signal } from "../../domain/Signal";
import { ProcessService } from "../process/ProcessService";
import { readConnectionStatus } from "./readConnectionStatus";
import { readProbeTargets } from "./readProbeTargets";

export class ConnectivityService extends Context.Tag("ConnectivityService")<
  ConnectivityService,
  {
    readonly targets: ProbeTargets;
    readonly readConnectionStatus: (input: {
      readonly family: Family;
      readonly signal: Signal;
    }) => Fx.Effect<CheckResult>;
  }
>() {
  static Live = Layer.effect(
    ConnectivityService,
    pipe(
      ProcessService,
      Effect.map((processService) => ({
        targets: readProbeTargets(Bun.env),
        readConnectionStatus: ({
          family,
          signal,
        }: {
          readonly family: Family;
          readonly signal: Signal;
        }) =>
          pipe(
            readConnectionStatus({
              family,
              signal,
              target: readProbeTargets(Bun.env)[signal][family],
            }),
            Effect.provideService(ProcessService, processService),
          ),
      })),
    ),
  );
}
