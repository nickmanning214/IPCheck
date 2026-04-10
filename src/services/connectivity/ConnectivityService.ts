import type { Effect as Fx } from "effect";
import { Context, Effect, Layer, pipe } from "effect";

import type { CheckResult } from "../../domain/CheckResult";
import type { Family } from "../../domain/Family";
import type { ProbeTargets } from "../../domain/ProbeTargets";
import type { SiteKey } from "../../domain/SiteKey";
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
    readonly readSiteStatus: (input: {
      readonly site: SiteKey;
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
                "%{http_code} %{time_total}",
                readProbeTargets(Bun.env).sites[site],
              ],
            }),
            Effect.flatMap(({ exitCode, stdout, stderr }) =>
              Effect.if(exitCode === 0, {
                onTrue: () =>
                  pipe(
                    stdout.trim().match(/^(\d{3})\s+([0-9.]+)$/),
                    (match) => ({
                      status: "online" as const,
                      detail:
                        match === null
                          ? "Site reachable"
                          : `HTTP ${match[1]} in ${(Number(match[2]) * 1000).toFixed(1)} ms`,
                      latencyMs:
                        match === null ? null : Number(match[2]) * 1000,
                    }),
                    Effect.succeed,
                  ),
                onFalse: () =>
                  Effect.succeed({
                    status: "offline" as const,
                    detail:
                      stderr.trim().length > 0
                        ? stderr.trim()
                        : "Site probe failed",
                    latencyMs: null,
                  }),
              }),
            ),
            Effect.catchAll(() =>
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
