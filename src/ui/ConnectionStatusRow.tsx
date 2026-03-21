import { Box, Text } from "ink";
import { Match, pipe } from "effect";

import type { ConnectionState } from "../domain/ConnectionState";
import { formatCheckedAt } from "./formatCheckedAt";
import { formatUptimePercentage } from "./formatUptimePercentage";

export const ConnectionStatusRow = ({
  label,
  result,
}: {
  readonly label: string;
  readonly result: ConnectionState;
}) => (
  <Box
    flexDirection="column"
    borderStyle="round"
    borderColor="gray"
    paddingX={1}
  >
    <Box justifyContent="space-between" width={60}>
      <Text bold>{label}</Text>
      <Box>
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
    </Box>
    <Text color="gray">{result.detail}</Text>
    <Text color="gray">
      {formatUptimePercentage({
        successfulChecks: result.successfulChecks,
        totalChecks: result.totalChecks,
      })}
    </Text>
    <Text color="gray">
      {formatCheckedAt({ checkedAt: result.lastCheckedAt })}
    </Text>
  </Box>
);
