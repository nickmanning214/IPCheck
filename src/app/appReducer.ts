import { Match, pipe } from "effect";

import type { AppAction } from "../domain/AppAction";
import type { AppState } from "../domain/AppState";

const latencyHistoryLimit = 10;
const rollingWindowLimitMs = 5 * 60 * 1000;

export const appReducer = (state: AppState, action: AppAction) =>
  pipe(
    Match.value(action),
    Match.when({ _tag: "CheckStarted", family: "ipv4" }, () => ({
      ...state,
      ipv4: {
        ...state.ipv4,
        isChecking: true,
      },
    })),
    Match.when({ _tag: "CheckStarted", family: "ipv6" }, () => ({
      ...state,
      ipv6: {
        ...state.ipv6,
        isChecking: true,
      },
    })),
    Match.when(
      { _tag: "CheckCompleted", family: "ipv4" },
      ({ checkedAt, result }) => ({
        ...state,
        ipv4: {
          ...state.ipv4,
          status: result.status,
          isChecking: false,
          detail: result.detail,
          lastCheckedAt: checkedAt,
          successfulChecks:
            state.ipv4.successfulChecks + (result.status === "online" ? 1 : 0),
          totalChecks: state.ipv4.totalChecks + 1,
          latencyHistoryMs:
            result.latencyMs === null
              ? state.ipv4.latencyHistoryMs
              : [...state.ipv4.latencyHistoryMs, result.latencyMs].slice(
                  -latencyHistoryLimit,
                ),
          recentChecks: [
            ...state.ipv4.recentChecks.filter(
              ({ checkedAt: sampleCheckedAt }) =>
                sampleCheckedAt >= checkedAt - rollingWindowLimitMs,
            ),
            {
              checkedAt,
              isSuccess: result.status === "online",
            },
          ],
        },
      }),
    ),
    Match.when(
      { _tag: "CheckCompleted", family: "ipv6" },
      ({ checkedAt, result }) => ({
        ...state,
        ipv6: {
          ...state.ipv6,
          status: result.status,
          isChecking: false,
          detail: result.detail,
          lastCheckedAt: checkedAt,
          successfulChecks:
            state.ipv6.successfulChecks + (result.status === "online" ? 1 : 0),
          totalChecks: state.ipv6.totalChecks + 1,
          latencyHistoryMs:
            result.latencyMs === null
              ? state.ipv6.latencyHistoryMs
              : [...state.ipv6.latencyHistoryMs, result.latencyMs].slice(
                  -latencyHistoryLimit,
                ),
          recentChecks: [
            ...state.ipv6.recentChecks.filter(
              ({ checkedAt: sampleCheckedAt }) =>
                sampleCheckedAt >= checkedAt - rollingWindowLimitMs,
            ),
            {
              checkedAt,
              isSuccess: result.status === "online",
            },
          ],
        },
      }),
    ),
    Match.exhaustive,
  );
