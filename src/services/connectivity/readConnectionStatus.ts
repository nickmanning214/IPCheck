import { Effect, Match, pipe } from "effect";

import type { CheckResult } from "../../domain/CheckResult";
import { ProcessService } from "../process/ProcessService";
import { pickFailureDetail } from "./pickFailureDetail";

const { run } = Effect.serviceFunctions(ProcessService);

export const readConnectionStatus = ({
  family,
}: {
  readonly family: "ipv4" | "ipv6";
}) =>
  pipe(
    Match.value(family),
    Match.when("ipv4", () =>
      run({
        command: "curl",
        args: [
          "-4",
          "--silent",
          "--show-error",
          "--max-time",
          "3",
          "https://api.ipify.org",
        ],
      }),
    ),
    Match.when("ipv6", () =>
      run({
        command: "curl",
        args: [
          "-6",
          "--silent",
          "--show-error",
          "--max-time",
          "3",
          "https://api64.ipify.org",
        ],
      }),
    ),
    Match.exhaustive,
    Effect.flatMap(({ exitCode, stdout, stderr }) =>
      Effect.if(exitCode === 0, {
        onTrue: () =>
          Effect.succeed<CheckResult>({
            status: "online",
            detail: pipe(stdout.trim(), (output) =>
              pipe(
                Match.value(output.length > 0),
                Match.when(true, () => `Address ${output}`),
                Match.orElse(() => "Reachable"),
              ),
            ),
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
