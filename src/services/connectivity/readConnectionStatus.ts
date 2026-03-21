import { Effect, Match, pipe } from "effect";

import type { CheckResult } from "../../domain/CheckResult";
import type { Family } from "../../domain/Family";
import { ProcessService } from "../process/ProcessService";
import { pickFailureDetail } from "./pickFailureDetail";
import { pickSuccessDetail } from "./pickSuccessDetail";
import { readLatencyMs } from "./readLatencyMs";

const { run } = Effect.serviceFunctions(ProcessService);

export const readConnectionStatus = ({
  family,
  target,
}: {
  readonly family: Family;
  readonly target: string;
}) =>
  pipe(
    Match.value(family),
    Match.when("ipv4", () =>
      run({
        command: "ping",
        args: ["-c", "1", "-W", "1000", target],
      }),
    ),
    Match.when("ipv6", () =>
      run({
        command: "ping6",
        args: ["-c", "1", target],
      }),
    ),
    Match.exhaustive,
    Effect.flatMap(({ exitCode, stdout, stderr }) =>
      Effect.if(exitCode === 0, {
        onTrue: () =>
          Effect.succeed<CheckResult>({
            status: "online",
            detail: pickSuccessDetail({ stdout }),
            latencyMs: readLatencyMs({ stdout }),
          }),
        onFalse: () =>
          Effect.succeed<CheckResult>({
            status: "offline",
            detail: pickFailureDetail({ stderr, stdout }),
            latencyMs: null,
          }),
      }),
    ),
    Effect.catchAll(() =>
      Effect.succeed<CheckResult>({
        status: "offline",
        detail: "Unable to execute the connectivity check",
        latencyMs: null,
      }),
    ),
  );
