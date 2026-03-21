import { Box, Newline, Text } from "ink";
import { Effect, Layer, pipe } from "effect";

import type { ProbeTargets } from "../domain/ProbeTargets";
import { useFork } from "../hooks/useFork";
import { ConnectivityService } from "../services/connectivity/ConnectivityService";
import { readProbeTargets } from "../services/connectivity/readProbeTargets";
import { ConnectionStatusRow } from "../ui/ConnectionStatusRow";
import { appReducer } from "./appReducer";
import { makeInitialAppState } from "./initialAppState";
import { runMonitorLoop } from "./runMonitorLoop";
import { useEffectReducer } from "./useEffectReducer";

export const App = ({
  intervalMs = 2000,
  connectivityLayer,
  probeTargets = readProbeTargets(Bun.env),
}: {
  readonly intervalMs?: number;
  readonly connectivityLayer: Layer.Layer<ConnectivityService>;
  readonly probeTargets?: ProbeTargets;
}) =>
  pipe(
    useEffectReducer(
      appReducer,
      makeInitialAppState({ startedAt: Date.now() }),
    ),
    ({ state, dispatch }) => (
      useFork(
        pipe(
          runMonitorLoop({ dispatch, intervalMs }),
          Effect.provide(connectivityLayer),
        ),
        [intervalMs, connectivityLayer],
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
          <ConnectionStatusRow
            label="IPv4"
            now={Date.now()}
            result={state.ipv4}
          />
          <Newline />
          <ConnectionStatusRow
            label="IPv6"
            now={Date.now()}
            result={state.ipv6}
          />
          <Text color="gray">IPv4 target: {probeTargets.ipv4}</Text>
          <Text color="gray">IPv6 target: {probeTargets.ipv6}</Text>
          <Text color="gray">
            Polls each family every {(intervalMs / 1000).toFixed(1)} seconds.
            Press Ctrl+C to exit.
          </Text>
        </Box>
      )
    ),
  );
