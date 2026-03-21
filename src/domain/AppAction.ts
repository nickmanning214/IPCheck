import type { CheckResult } from "./CheckResult";
import type { Family } from "./Family";
import type { Signal } from "./Signal";

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
    };
