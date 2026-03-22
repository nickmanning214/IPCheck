import { Box, Newline, Text } from "ink";
import { Effect, Layer, pipe } from "effect";

import type { ProbeTargets } from "../domain/ProbeTargets";
import { useFork } from "../hooks/useFork";
import { ConnectivityService } from "../services/connectivity/ConnectivityService";
import { readProbeTargets } from "../services/connectivity/readProbeTargets";
import { formatRunDuration } from "../ui/formatRunDuration";
import { formatStartedAt } from "../ui/formatStartedAt";
import { SignalSection } from "../ui/SignalSection";
import { SummaryRow } from "../ui/SummaryRow";
import { appReducer } from "./appReducer";
import { makeInitialAppState } from "./initialAppState";
import { runMonitorLoop } from "./runMonitorLoop";
import { useEffectReducer } from "./useEffectReducer";

export const App = ({
  intervalMs = 1000,
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
      pipe(Date.now(), (now) => (
        <Box flexDirection="column" padding={1}>
          <Text bold color="cyan">
            IPCheck
          </Text>
          <Text color="gray">
            Continuous IPv4 and IPv6 reachability monitor
          </Text>
          <Text color="gray">
            {formatStartedAt({ startedAt: state.startedAt })} | Running{" "}
            {formatRunDuration({ now, startedAt: state.startedAt })} | Poll
            every {(intervalMs / 1000).toFixed(1)}s per family
          </Text>
          <Newline />
          <Box columnGap={2}>
            <SummaryRow label="Ping" state={state.ping} />
            <SummaryRow label="HTTP" state={state.http} />
            <SummaryRow label="Direct" state={state.direct} />
          </Box>
          <Newline />
          <Box columnGap={1}>
            <SignalSection label="Ping" now={now} state={state.ping} />
            <SignalSection label="HTTP" now={now} state={state.http} />
            <SignalSection
              label="Direct HTTPS"
              now={now}
              state={state.direct}
            />
          </Box>
          <Newline />
          <Text color="gray">
            Targets Ping: {probeTargets.ping.ipv4} | {probeTargets.ping.ipv6}
          </Text>
          <Text color="gray">
            Targets HTTP: {probeTargets.http.ipv4} | {probeTargets.http.ipv6}
          </Text>
          <Text color="gray">
            Targets Direct: {probeTargets.direct.ipv4} |{" "}
            {probeTargets.direct.ipv6}
          </Text>
          <Text color="gray">
            Polls each family every {(intervalMs / 1000).toFixed(1)} seconds.
            Press Ctrl+C to exit.
          </Text>
        </Box>
      ))
    ),
  );
