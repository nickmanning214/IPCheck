import { pipe } from "effect";

import type { RecentCheck } from "../domain/RecentCheck";

export const readRollingWindowUptime = ({
  now,
  recentChecks,
  windowMs,
}: {
  readonly now: number;
  readonly recentChecks: ReadonlyArray<RecentCheck>;
  readonly windowMs: number;
}) =>
  pipe(
    recentChecks.filter(({ checkedAt }) => checkedAt >= now - windowMs),
    (windowChecks) => ({
      successfulChecks: windowChecks.filter(({ isSuccess }) => isSuccess)
        .length,
      totalChecks: windowChecks.length,
    }),
  );
