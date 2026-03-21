import type { CheckResult } from "./CheckResult";
import type { Family } from "./Family";

export type AppAction =
  | { readonly _tag: "CheckStarted"; readonly family: Family }
  | {
      readonly _tag: "CheckCompleted";
      readonly family: Family;
      readonly checkedAt: number;
      readonly result: CheckResult;
    };
