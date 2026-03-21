import { Box, Text } from "ink";
import { pipe } from "effect";

import type { AppState } from "../domain/AppState";
import { formatUptimePercentage } from "./formatUptimePercentage";

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
    <Text color="gray">
      {pipe(
        [
          `v4 ${formatUptimePercentage({
            label: "",
            successfulChecks: state.ipv4.successfulChecks,
            totalChecks: state.ipv4.totalChecks,
          }).replace(": ", "")}`,
          `v6 ${formatUptimePercentage({
            label: "",
            successfulChecks: state.ipv6.successfulChecks,
            totalChecks: state.ipv6.totalChecks,
          }).replace(": ", "")}`,
        ],
        (parts) => parts.join("  "),
      )}
    </Text>
  </Box>
);
