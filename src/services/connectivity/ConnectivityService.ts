import type { Effect as Fx } from "effect";
import { Context, Effect, Layer, Match, pipe } from "effect";

import type { CheckResult } from "../../domain/CheckResult";
import type { Family } from "../../domain/Family";
import type { ProbeTargets } from "../../domain/ProbeTargets";
import type { SiteKey } from "../../domain/SiteKey";
import type { Signal } from "../../domain/Signal";
import { ProcessService } from "../process/ProcessService";
import { readConnectionStatus } from "./readConnectionStatus";
import { readCurlSiteResult } from "./readCurlSiteResult";
import { readProbeTargets } from "./readProbeTargets";

export class ConnectivityService extends Context.Service<
  ConnectivityService,
  {
    readonly targets: ProbeTargets;
    readonly readConnectionStatus: (input: {
      readonly family: Family;
      readonly signal: Signal;
    }) => Fx.Effect<CheckResult>;
    readonly readSiteStatus: (input: {
      readonly site: SiteKey;
    }) => Fx.Effect<CheckResult>;
  }
>()("ConnectivityService") {
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
        readSiteStatus: ({ site }: { readonly site: SiteKey }) =>
          pipe(
            processService.run({
              command: "curl",
              args: [
                "--silent",
                "--show-error",
                "--output",
                "/dev/null",
                "--connect-timeout",
                "2",
                "--max-time",
                "5",
                "--write-out",
                "%{http_code} %{time_total} %{remote_ip}",
                readProbeTargets(Bun.env).sites[site],
              ],
            }),
            Effect.flatMap(({ exitCode, stdout, stderr }) =>
              Effect.succeed(
                pipe(
                  Match.value(exitCode),
                  Match.when(0, () => readCurlSiteResult({ stdout })),
                  Match.orElse(() => ({
                    status: "offline" as const,
                    detail:
                      stderr.trim().length > 0
                        ? stderr.trim()
                        : "Site probe failed",
                    latencyMs: null,
                  })),
                ),
              ),
            ),
            Effect.catchCause(() =>
              Effect.succeed({
                status: "offline" as const,
                detail: "Unable to execute the site check",
                latencyMs: null,
              }),
            ),
          ),
      })),
    ),
  );
}
