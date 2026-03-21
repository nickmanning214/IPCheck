import { Match, pipe } from "effect";

export const formatUptimePercentage = ({
  label = "Uptime since start",
  successfulChecks,
  totalChecks,
}: {
  readonly label?: string;
  readonly successfulChecks: number;
  readonly totalChecks: number;
}) =>
  pipe(
    Match.value(totalChecks),
    Match.when(0, () => `${label}: waiting for data`),
    Match.orElse(
      (count) => `${label}: ${((successfulChecks / count) * 100).toFixed(1)}%`,
    ),
  );
