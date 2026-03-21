import { Box, Newline, Text } from "ink";
import { Effect, Layer, pipe } from "effect";

import { useFork } from "../hooks/useFork";
import { ConnectivityService } from "../services/connectivity/ConnectivityService";
import { ConnectionStatusRow } from "../ui/ConnectionStatusRow";
import { formatCheckedAt } from "../ui/formatCheckedAt";
import { appReducer } from "./appReducer";
import { initialAppState } from "./initialAppState";
import { runMonitorLoop } from "./runMonitorLoop";
import { useEffectReducer } from "./useEffectReducer";

export const App = ({
  intervalMs = 5000,
  connectivityLayer,
}: {
  readonly intervalMs?: number;
  readonly connectivityLayer: Layer.Layer<ConnectivityService>;
}) =>
  pipe(
    useEffectReducer(appReducer, initialAppState),
    ({ state, dispatch }) => (
      useFork(
        pipe(
          runMonitorLoop({ dispatch, intervalMs }),
          Effect.provide(connectivityLayer),
        ),
        [dispatch, intervalMs, connectivityLayer],
      ),
      (
        <Box flexDirection="column" padding={1}>
          <Text bold color="cyan">
            IPCheck
          </Text>
          <Text color="gray">
            Continuous IPv4 and IPv6 reachability monitor
          </Text>
          <Newline />
          <ConnectionStatusRow label="IPv4" result={state.ipv4} />
          <Newline />
          <ConnectionStatusRow label="IPv6" result={state.ipv6} />
          <Newline />
          <Text>{formatCheckedAt({ checkedAt: state.checkedAt })}</Text>
          <Text color="gray">
            Runs every {Math.round(intervalMs / 1000)} seconds. Press Ctrl+C to
            exit.
          </Text>
        </Box>
      )
    ),
  );
