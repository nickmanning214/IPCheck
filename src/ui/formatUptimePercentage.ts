import { Match, pipe } from "effect";

export const formatUptimePercentage = ({
  successfulChecks,
  totalChecks,
}: {
  readonly successfulChecks: number;
  readonly totalChecks: number;
}) =>
  pipe(
    Match.value(totalChecks),
    Match.when(0, () => "Uptime since start: waiting for data"),
    Match.orElse(
      (count) =>
        `Uptime since start: ${((successfulChecks / count) * 100).toFixed(1)}%`,
    ),
  );
