import { Match, pipe } from "effect";

import type { ConnectionState } from "../domain/ConnectionState";
import { formatOutageDuration } from "./formatOutageDuration";

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
});

export const formatOutages = ({
  now,
  result,
}: {
  readonly now: number;
  readonly result: ConnectionState;
}) =>
  pipe(
    [
      ...result.outages
        .slice(-2)
        .map(
          ({ durationMs, startedAt }) =>
            `${timeFormatter.format(startedAt)} ${formatOutageDuration({ durationMs })}`,
        ),
      ...pipe(
        Match.value(result.outageStartedAt),
        Match.when(null, () => [] as ReadonlyArray<string>),
        Match.orElse((startedAt) => [
          `${timeFormatter.format(startedAt)} ongoing ${formatOutageDuration({
            durationMs: now - startedAt,
          })}`,
        ]),
      ),
    ],
    (entries) =>
      entries.length === 0
        ? "Outages: none yet"
        : `Outages: ${entries.join(" | ")}`,
  );
