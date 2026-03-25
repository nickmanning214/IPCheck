import type { Outage } from "./Outage";
import type { RecentCheck } from "./RecentCheck";

export type ConnectionState = {
  readonly status: "unknown" | "online" | "offline";
  readonly isChecking: boolean;
  readonly detail: string;
  readonly lastCheckedAt: number | null;
  readonly successfulChecks: number;
  readonly totalChecks: number;
  readonly latencyHistoryMs: ReadonlyArray<number>;
  readonly recentChecks: ReadonlyArray<RecentCheck>;
  readonly outageStartedAt: number | null;
  readonly outages: ReadonlyArray<Outage>;
};
