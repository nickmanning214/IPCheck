import { Box, Text } from "ink";

import type { AppState } from "../domain/AppState";
import { ConnectionStatusRow } from "./ConnectionStatusRow";

export const SignalSection = ({
  label,
  now,
  state,
}: {
  readonly label: string;
  readonly now: number;
  readonly state: AppState["ping"];
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
  </Box>
);
