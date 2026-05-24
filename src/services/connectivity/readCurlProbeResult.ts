import { Match, Schema, pipe } from "effect";

import { CheckResultSchema } from "../../domain/CheckResult";
import type { Family } from "../../domain/Family";

export const readCurlProbeResult = ({
  family,
  successPrefix,
  stdout,
}: {
  readonly family: Family;
  readonly successPrefix: string;
  readonly stdout: string;
}) =>
  pipe(stdout.trim().split("\n"), (lines) =>
    pipe(
      (lines.at(-1) || "").match(/^(\d{3})\s+([0-9.]+)\s+(.+)$/),
      Match.value,
      Match.when(null, () =>
        Schema.decodeUnknownSync(CheckResultSchema)({
          status: "offline",
          detail:
            "Curl probe did not report HTTP status, timing, and remote address",
          latencyMs: null,
        }),
      ),
      Match.orElse((match) =>
        pipe(
          {
            body: lines.slice(0, -1).join("\n").trim(),
            httpCode: match[1],
            latencyMs: Number(match[2]) * 1000,
            remoteIp: match[3],
          },
          ({ body, httpCode, latencyMs, remoteIp }) =>
            pipe(
              Match.value({
                family,
                isIpv4Mapped: remoteIp.startsWith("::ffff:"),
                isIpv6Address: remoteIp.includes(":"),
              }),
              Match.when({ family: "ipv6", isIpv4Mapped: true }, () =>
                Schema.decodeUnknownSync(CheckResultSchema)({
                  status: "offline",
                  detail: `Expected native IPv6 but curl connected through IPv4-mapped ${remoteIp}`,
                  latencyMs: null,
                }),
              ),
              Match.when(
                { family: "ipv6", isIpv4Mapped: false, isIpv6Address: false },
                () =>
                  Schema.decodeUnknownSync(CheckResultSchema)({
                    status: "offline",
                    detail: `Expected IPv6 but curl connected to IPv4 ${remoteIp}`,
                    latencyMs: null,
                  }),
              ),
              Match.when({ family: "ipv4", isIpv6Address: true }, () =>
                Schema.decodeUnknownSync(CheckResultSchema)({
                  status: "offline",
                  detail: `Expected IPv4 but curl connected to IPv6 ${remoteIp}`,
                  latencyMs: null,
                }),
              ),
              Match.orElse(() =>
                Schema.decodeUnknownSync(CheckResultSchema)({
                  status: "online",
                  detail:
                    body.length > 0
                      ? `${successPrefix} ${body} via ${family === "ipv6" ? "IPv6" : "IPv4"} ${remoteIp}`
                      : `HTTP ${httpCode} via ${family === "ipv6" ? "IPv6" : "IPv4"} ${remoteIp} in ${latencyMs.toFixed(1)} ms`,
                  latencyMs,
                }),
              ),
            ),
        ),
      ),
    ),
  );
