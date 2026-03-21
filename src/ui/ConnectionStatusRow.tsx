import { Box, Text } from "ink";
import { Match, pipe } from "effect";

import type { CheckResult } from "../domain/CheckResult";

export const ConnectionStatusRow = ({
  label,
  result,
}: {
  readonly label: string;
  readonly result: CheckResult;
}) => (
  <Box
    flexDirection="column"
    borderStyle="round"
    borderColor="gray"
    paddingX={1}
  >
    <Box justifyContent="space-between" width={60}>
      <Text bold>{label}</Text>
      {pipe(
        Match.value(result.status),
        Match.when("checking", () => <Text color="yellow">CHECKING</Text>),
        Match.when("online", () => <Text color="green">ONLINE</Text>),
        Match.when("offline", () => <Text color="red">OFFLINE</Text>),
        Match.exhaustive,
      )}
    </Box>
    <Text color="gray">{result.detail}</Text>
  </Box>
);
