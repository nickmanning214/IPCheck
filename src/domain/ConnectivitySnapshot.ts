import type { CheckResult } from "./CheckResult";

export type ConnectivitySnapshot = {
  readonly ipv4: CheckResult;
  readonly ipv6: CheckResult;
  readonly checkedAt: number | null;
};
