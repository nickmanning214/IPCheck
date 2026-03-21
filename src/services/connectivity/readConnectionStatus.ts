import { Effect, Match, pipe } from "effect";

import type { CheckResult } from "../../domain/CheckResult";
import type { Family } from "../../domain/Family";
import { ProcessService } from "../process/ProcessService";
import { pickFailureDetail } from "./pickFailureDetail";
import { pickSuccessDetail } from "./pickSuccessDetail";

const { run } = Effect.serviceFunctions(ProcessService);

export const readConnectionStatus = ({ family }: { readonly family: Family }) =>
  pipe(
    Match.value(family),
    Match.when("ipv4", () =>
      run({
        command: "ping",
        args: ["-c", "1", "-W", "1000", "1.1.1.1"],
      }),
    ),
    Match.when("ipv6", () =>
      run({
        command: "ping6",
        args: ["-c", "1", "2001:4860:4860::8888"],
      }),
    ),
    Match.exhaustive,
    Effect.flatMap(({ exitCode, stdout, stderr }) =>
      Effect.if(exitCode === 0, {
        onTrue: () =>
          Effect.succeed<CheckResult>({
            status: "online",
            detail: pickSuccessDetail({ stdout }),
          }),
        onFalse: () =>
          Effect.succeed<CheckResult>({
            status: "offline",
            detail: pickFailureDetail({ stderr, stdout }),
          }),
      }),
    ),
    Effect.catchAll(() =>
      Effect.succeed<CheckResult>({
        status: "offline",
        detail: "Unable to execute the connectivity check",
      }),
    ),
  );
