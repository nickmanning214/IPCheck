import { Box, Newline, Text } from "ink";

import type { AppState } from "../domain/AppState";
import { ConnectionStatusRow } from "./ConnectionStatusRow";

export const SignalSection = ({
  label,
  now,
  state,
  targets,
}: {
  readonly label: string;
  readonly now: number;
  readonly state: AppState["ping"];
  readonly targets: {
    readonly ipv4: string;
    readonly ipv6: string;
  };
}) => (
  <Box flexDirection="column">
    <Text bold>{label}</Text>
    <ConnectionStatusRow label="IPv4" now={now} result={state.ipv4} />
    <Newline />
    <ConnectionStatusRow label="IPv6" now={now} result={state.ipv6} />
    <Text color="gray">
      {label} IPv4 target: {targets.ipv4}
    </Text>
    <Text color="gray">
      {label} IPv6 target: {targets.ipv6}
    </Text>
  </Box>
);
