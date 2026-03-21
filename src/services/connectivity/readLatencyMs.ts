import { pipe } from "effect";

export const readLatencyMs = ({ stdout }: { readonly stdout: string }) =>
  pipe(stdout.match(/time=([0-9.]+)\s*ms/), (match) =>
    match === null ? null : Number(match[1]),
  );
