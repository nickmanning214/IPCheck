import type { CheckResult } from "./CheckResult";
import type { Family } from "./Family";
import type { Signal } from "./Signal";
import type { SiteKey } from "./SiteKey";

export type AppAction =
  | {
      readonly _tag: "CheckStarted";
      readonly signal: Signal;
      readonly family: Family;
    }
  | {
      readonly _tag: "CheckCompleted";
      readonly signal: Signal;
      readonly family: Family;
      readonly checkedAt: number;
      readonly result: CheckResult;
    }
  | {
      readonly _tag: "SiteCheckStarted";
      readonly site: SiteKey;
    }
  | {
      readonly _tag: "SiteCheckCompleted";
      readonly site: SiteKey;
      readonly checkedAt: number;
      readonly result: CheckResult;
    };
