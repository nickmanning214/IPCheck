import { pipe } from "effect";

export const formatOutageDuration = ({
  durationMs,
}: {
  readonly durationMs: number;
}) =>
  pipe(Math.max(0, Math.floor(durationMs / 1000)), (totalSeconds) =>
    pipe(
      [
        Math.floor(totalSeconds / 3600),
        Math.floor((totalSeconds % 3600) / 60),
        totalSeconds % 60,
      ],
      ([hours, minutes, seconds]) =>
        hours > 0
          ? `${hours}h ${minutes}m ${seconds}s`
          : minutes > 0
            ? `${minutes}m ${seconds}s`
            : `${seconds}s`,
    ),
  );
