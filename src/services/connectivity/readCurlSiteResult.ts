import { Match, Schema, pipe } from "effect";

import { CheckResultSchema } from "../../domain/CheckResult";

export const readCurlSiteResult = ({ stdout }: { readonly stdout: string }) =>
  pipe(
    stdout.trim().match(/^(\d{3})\s+([0-9.]+)\s+(.+)$/),
    Match.value,
    Match.when(null, () =>
      Schema.decodeUnknownSync(CheckResultSchema)({
        status: "offline",
        detail:
          "Site probe did not report HTTP status, timing, and remote address",
        latencyMs: null,
      }),
    ),
    Match.orElse((match) =>
      pipe(
        {
          httpCode: match[1],
          latencyMs: Number(match[2]) * 1000,
          remoteIp: match[3],
        },
        ({ httpCode, latencyMs, remoteIp }) =>
          Schema.decodeUnknownSync(CheckResultSchema)({
            status: "online",
            detail: `HTTP ${httpCode} via ${pipe(
              Match.value({
                isIpv4Mapped: remoteIp.startsWith("::ffff:"),
                isIpv6Address: remoteIp.includes(":"),
              }),
              Match.when({ isIpv4Mapped: true }, () => "IPv4-mapped"),
              Match.when(
                { isIpv4Mapped: false, isIpv6Address: true },
                () => "IPv6",
              ),
              Match.orElse(() => "IPv4"),
            )} ${remoteIp} in ${latencyMs.toFixed(1)} ms`,
            latencyMs,
          }),
      ),
    ),
  );
