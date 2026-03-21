import { Box, Text } from "ink";
import { Match, pipe } from "effect";

import type { ConnectionState } from "../domain/ConnectionState";
import { formatCheckedAt } from "./formatCheckedAt";
import { formatLatencyHistory } from "./formatLatencyHistory";
import { formatUptimePercentage } from "./formatUptimePercentage";
import { readRollingWindowUptime } from "./readRollingWindowUptime";

export const ConnectionStatusRow = ({
  label,
  now,
  result,
}: {
  readonly label: string;
  readonly now: number;
  readonly result: ConnectionState;
}) => (
  <Box flexDirection="column" flexGrow={1} flexBasis={0}>
    <Box>
      <Text bold>{label}</Text>
      <Text> </Text>
      {pipe(
        Match.value(result.status),
        Match.when("unknown", () => <Text color="yellow">UNKNOWN</Text>),
        Match.when("online", () => <Text color="green">ONLINE</Text>),
        Match.when("offline", () => <Text color="red">OFFLINE</Text>),
        Match.exhaustive,
      )}
      {pipe(
        Match.value(result.isChecking),
        Match.when(true, () => <Text color="yellow"> POLLING</Text>),
        Match.orElse(() => <Text />),
      )}
    </Box>
    <Text color="gray">{result.detail}</Text>
    <Text color="gray">
      {[
        formatUptimePercentage({
          label: "Up",
          successfulChecks: result.successfulChecks,
          totalChecks: result.totalChecks,
        }),
        formatUptimePercentage({
          label: "1m",
          ...readRollingWindowUptime({
            now,
            recentChecks: result.recentChecks,
            windowMs: 60 * 1000,
          }),
        }),
        formatUptimePercentage({
          label: "5m",
          ...readRollingWindowUptime({
            now,
            recentChecks: result.recentChecks,
            windowMs: 5 * 60 * 1000,
          }),
        }),
      ].join(" | ")}
    </Text>
    <Text color="gray">
      {formatLatencyHistory({ latencyHistoryMs: result.latencyHistoryMs })}
    </Text>
    <Text color="gray">
      {formatCheckedAt({ checkedAt: result.lastCheckedAt })}
    </Text>
  </Box>
);
