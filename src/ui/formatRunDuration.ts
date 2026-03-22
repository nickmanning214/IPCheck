import { pipe } from "effect";

export const formatRunDuration = ({
  now,
  startedAt,
}: {
  readonly now: number;
  readonly startedAt: number;
}) =>
  pipe(Math.max(0, Math.floor((now - startedAt) / 1000)), (totalSeconds) =>
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
