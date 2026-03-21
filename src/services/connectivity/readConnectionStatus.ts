import { Effect, Match, pipe } from "effect";

import type { CheckResult } from "../../domain/CheckResult";
import type { Family } from "../../domain/Family";
import type { Signal } from "../../domain/Signal";
import { ProcessService } from "../process/ProcessService";
import { pickFailureDetail } from "./pickFailureDetail";
import { pickSuccessDetail } from "./pickSuccessDetail";
import { readLatencyMs } from "./readLatencyMs";

const { run } = Effect.serviceFunctions(ProcessService);

export const readConnectionStatus = ({
  family,
  signal,
  target,
}: {
  readonly family: Family;
  readonly signal: Signal;
  readonly target: string;
}) =>
  pipe(
    Match.value(signal),
    Match.when("ping", () =>
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
      ),
    ),
    Match.when("http", () =>
      pipe(
        Match.value(family),
        Match.when("ipv4", () =>
          run({
            command: "curl",
            args: [
              "-4",
              "--silent",
              "--show-error",
              "--insecure",
              "--connect-timeout",
              "2",
              "--max-time",
              "5",
              "--output",
              "/dev/null",
              "--write-out",
              "%{http_code} %{time_total}",
              target,
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
              "--insecure",
              "--connect-timeout",
              "2",
              "--max-time",
              "5",
              "--output",
              "/dev/null",
              "--write-out",
              "%{http_code} %{time_total}",
              target,
            ],
          }),
        ),
        Match.exhaustive,
        Effect.flatMap(({ exitCode, stdout, stderr }) =>
          Effect.if(exitCode === 0, {
            onTrue: () =>
              pipe(
                stdout.trim().match(/^(\d{3})\s+([0-9.]+)$/),
                Match.value,
                Match.when(null, () =>
                  Effect.succeed<CheckResult>({
                    status: "online",
                    detail: "HTTP reachable",
                    latencyMs: null,
                  }),
                ),
                Match.orElse((match) =>
                  Effect.succeed<CheckResult>({
                    status: "online",
                    detail: `HTTP ${match[1]} in ${(Number(match[2]) * 1000).toFixed(1)} ms`,
                    latencyMs: Number(match[2]) * 1000,
                  }),
                ),
              ),
            onFalse: () =>
              Effect.succeed<CheckResult>({
                status: "offline",
                detail: pickFailureDetail({ stderr, stdout }),
                latencyMs: null,
              }),
          }),
        ),
      ),
    ),
    Match.exhaustive,
    Effect.catchAll(() =>
      Effect.succeed<CheckResult>({
        status: "offline",
        detail: "Unable to execute the connectivity check",
        latencyMs: null,
      }),
    ),
  );
