import { Box, Newline, Text } from "ink";
import { Effect, Layer, pipe } from "effect";

import type { ProbeTargets } from "../domain/ProbeTargets";
import { useFork } from "../hooks/useFork";
import { ConnectivityService } from "../services/connectivity/ConnectivityService";
import { readProbeTargets } from "../services/connectivity/readProbeTargets";
import { SignalSection } from "../ui/SignalSection";
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
          <SignalSection
            label="Ping"
            now={Date.now()}
            state={state.ping}
            targets={probeTargets.ping}
          />
          <Newline />
          <SignalSection
            label="HTTP"
            now={Date.now()}
            state={state.http}
            targets={probeTargets.http}
          />
          <Newline />
          <SignalSection
            label="Direct HTTPS"
            now={Date.now()}
            state={state.direct}
            targets={probeTargets.direct}
          />
          <Text color="gray">
            Polls each family every {(intervalMs / 1000).toFixed(1)} seconds.
            Press Ctrl+C to exit.
          </Text>
        </Box>
      )
    ),
  );
