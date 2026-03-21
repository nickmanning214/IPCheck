import { Match, pipe } from "effect";

export const pickSuccessDetail = ({ stdout }: { readonly stdout: string }) =>
  pipe(
    stdout.match(/time=([0-9.]+)\s*ms/),
    Match.value,
    Match.when(null, () => "Reachable"),
    Match.orElse((match) => `Reply in ${match[1]} ms`),
  );
