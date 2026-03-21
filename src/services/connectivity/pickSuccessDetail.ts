import { Match, pipe } from "effect";

import { readLatencyMs } from "./readLatencyMs";

export const pickSuccessDetail = ({ stdout }: { readonly stdout: string }) =>
  pipe(
    readLatencyMs({ stdout }),
    Match.value,
    Match.when(null, () => "Reachable"),
    Match.orElse((latencyMs) => `Reply in ${latencyMs} ms`),
  );
