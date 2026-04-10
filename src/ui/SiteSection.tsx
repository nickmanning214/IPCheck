import { Box, Text } from "ink";

import type { AppState } from "../domain/AppState";
import { ConnectionStatusRow } from "./ConnectionStatusRow";

export const SiteSection = ({
  now,
  state,
  targets,
}: {
  readonly now: number;
  readonly state: AppState["sites"];
  readonly targets: {
    readonly plaintextsports: string;
    readonly slack: string;
  };
}) => (
  <Box
    flexDirection="column"
    borderStyle="round"
    borderColor="cyan"
    paddingX={1}
  >
    <Text bold>Sites</Text>
    <Box columnGap={1}>
      <ConnectionStatusRow
        label="Plaintext Sports"
        now={now}
        result={state.plaintextsports}
      />
      <ConnectionStatusRow label="Slack" now={now} result={state.slack} />
    </Box>
    <Text color="gray">
      Browser-default probes: {targets.plaintextsports} | {targets.slack}
    </Text>
  </Box>
);
