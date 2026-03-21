import { Match, pipe } from "effect";

export const formatLatencyHistory = ({
  latencyHistoryMs,
}: {
  readonly latencyHistoryMs: ReadonlyArray<number>;
}) =>
  pipe(
    Match.value(latencyHistoryMs.length),
    Match.when(0, () => "Recent latency: waiting for data"),
    Match.orElse(
      () =>
        `Recent latency: ${latencyHistoryMs.map((value) => value.toFixed(1)).join(", ")} ms`,
    ),
  );
