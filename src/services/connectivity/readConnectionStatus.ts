import { Effect, Match, pipe } from "effect";

import type { CheckResult } from "../../domain/CheckResult";
import type { Family } from "../../domain/Family";
import type { Signal } from "../../domain/Signal";
import { ProcessService } from "../process/ProcessService";
import { pickFailureDetail } from "./pickFailureDetail";
import { pickSuccessDetail } from "./pickSuccessDetail";
import { readCurlProbeResult } from "./readCurlProbeResult";
import { readLatencyMs } from "./readLatencyMs";

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
        ProcessService,
        Effect.flatMap(({ run }) =>
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
          ),
        ),
        Effect.flatMap(({ exitCode, stdout, stderr }) =>
          Effect.succeed(
            pipe(
              Match.value(exitCode),
              Match.when(0, () => ({
                status: "online" as const,
                detail: pickSuccessDetail({ stdout }),
                latencyMs: readLatencyMs({ stdout }),
              })),
              Match.orElse(() => ({
                status: "offline" as const,
                detail: pickFailureDetail({ stderr, stdout }),
                latencyMs: null,
              })),
            ),
          ),
        ),
      ),
    ),
    Match.when("http", () =>
      pipe(
        ProcessService,
        Effect.flatMap(({ run }) =>
          pipe(
            Match.value(family),
            Match.when("ipv4", () =>
              run({
                command: "curl",
                args: [
                  "-4",
                  "--noproxy",
                  "*",
                  "--silent",
                  "--show-error",
                  "--connect-timeout",
                  "2",
                  "--max-time",
                  "5",
                  "--write-out",
                  "\n%{http_code} %{time_total} %{remote_ip}",
                  target,
                ],
              }),
            ),
            Match.when("ipv6", () =>
              run({
                command: "curl",
                args: [
                  "-6",
                  "--noproxy",
                  "*",
                  "--silent",
                  "--show-error",
                  "--connect-timeout",
                  "2",
                  "--max-time",
                  "5",
                  "--write-out",
                  "\n%{http_code} %{time_total} %{remote_ip}",
                  target,
                ],
              }),
            ),
            Match.exhaustive,
          ),
        ),
        Effect.flatMap(({ exitCode, stdout, stderr }) =>
          Effect.succeed(
            pipe(
              Match.value(exitCode),
              Match.when(0, () =>
                readCurlProbeResult({
                  family,
                  successPrefix: "Address",
                  stdout,
                }),
              ),
              Match.orElse(() => ({
                status: "offline" as const,
                detail: pickFailureDetail({ stderr, stdout }),
                latencyMs: null,
              })),
            ),
          ),
        ),
      ),
    ),
    Match.when("direct", () =>
      pipe(
        ProcessService,
        Effect.flatMap(({ run }) =>
          pipe(
            Match.value(family),
            Match.when("ipv4", () =>
              run({
                command: "curl",
                args: [
                  "-4",
                  "--noproxy",
                  "*",
                  "--silent",
                  "--show-error",
                  "--insecure",
                  "--connect-timeout",
                  "2",
                  "--max-time",
                  "5",
                  "--write-out",
                  "\n%{http_code} %{time_total} %{remote_ip}",
                  target,
                ],
              }),
            ),
            Match.when("ipv6", () =>
              run({
                command: "curl",
                args: [
                  "-6",
                  "--noproxy",
                  "*",
                  "--silent",
                  "--show-error",
                  "--insecure",
                  "--connect-timeout",
                  "2",
                  "--max-time",
                  "5",
                  "--write-out",
                  "\n%{http_code} %{time_total} %{remote_ip}",
                  target,
                ],
              }),
            ),
            Match.exhaustive,
          ),
        ),
        Effect.flatMap(({ exitCode, stdout, stderr }) =>
          Effect.succeed(
            pipe(
              Match.value(exitCode),
              Match.when(0, () =>
                readCurlProbeResult({
                  family,
                  successPrefix: "Response",
                  stdout,
                }),
              ),
              Match.orElse(() => ({
                status: "offline" as const,
                detail: pickFailureDetail({ stderr, stdout }),
                latencyMs: null,
              })),
            ),
          ),
        ),
      ),
    ),
    Match.exhaustive,
    Effect.catchCause(() =>
      Effect.succeed<CheckResult>({
        status: "offline",
        detail: "Unable to execute the connectivity check",
        latencyMs: null,
      }),
    ),
  );
