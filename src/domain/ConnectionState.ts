export type ConnectionState = {
  readonly status: "unknown" | "online" | "offline";
  readonly isChecking: boolean;
  readonly detail: string;
  readonly lastCheckedAt: number | null;
  readonly successfulChecks: number;
  readonly totalChecks: number;
};
