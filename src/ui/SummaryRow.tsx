import { Box, Text } from "ink";
import { Match, pipe } from "effect";

import type { AppState } from "../domain/AppState";

export const SummaryRow = ({
  label,
  state,
}: {
  readonly label: string;
  readonly state: AppState["ping"];
}) => (
  <Box>
    <Text bold>{label}</Text>
    <Text color="gray"> </Text>
    <Text color="gray">v4 </Text>
    {pipe(
      Match.value(state.ipv4.status),
      Match.when("unknown", () => <Text color="yellow">?</Text>),
      Match.when("online", () => <Text color="green">up</Text>),
      Match.when("offline", () => <Text color="red">down</Text>),
      Match.exhaustive,
    )}
    <Text color="gray"> </Text>
    <Text color="gray">v6 </Text>
    {pipe(
      Match.value(state.ipv6.status),
      Match.when("unknown", () => <Text color="yellow">?</Text>),
      Match.when("online", () => <Text color="green">up</Text>),
      Match.when("offline", () => <Text color="red">down</Text>),
      Match.exhaustive,
    )}
  </Box>
);
