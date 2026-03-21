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
  <Box
    flexDirection="column"
    borderStyle="round"
    borderColor="cyan"
    paddingX={1}
    flexGrow={1}
    flexBasis={0}
  >
    <Text bold>{label}</Text>
    <Box columnGap={1}>
      <ConnectionStatusRow label="IPv4" now={now} result={state.ipv4} />
      <ConnectionStatusRow label="IPv6" now={now} result={state.ipv6} />
    </Box>
    <Newline />
    <Text color="gray">
      {label} IPv4 target: {targets.ipv4}
    </Text>
    <Text color="gray">
      {label} IPv6 target: {targets.ipv6}
    </Text>
  </Box>
);
