import { Box, Text } from "ink";
import { pipe } from "effect";

import type { AppState } from "../domain/AppState";
import { formatUptimePercentage } from "./formatUptimePercentage";

export const SitesSummaryRow = ({
  state,
}: {
  readonly state: AppState["sites"];
}) => (
  <Box>
    <Text bold>Sites</Text>
    <Text color="gray"> </Text>
    <Text color="gray">
      {pipe(
        [
          `PTS ${formatUptimePercentage({
            label: "",
            successfulChecks: state.plaintextsports.successfulChecks,
            totalChecks: state.plaintextsports.totalChecks,
          }).replace(": ", "")}`,
          `Slack ${formatUptimePercentage({
            label: "",
            successfulChecks: state.slack.successfulChecks,
            totalChecks: state.slack.totalChecks,
          }).replace(": ", "")}`,
        ],
        (parts) => parts.join("  "),
      )}
    </Text>
  </Box>
);
