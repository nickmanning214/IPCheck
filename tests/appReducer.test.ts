import { describe, expect, test } from "bun:test";

import { appReducer } from "../src/app/appReducer";
import { initialAppState } from "../src/app/initialAppState";

describe("appReducer", () => {
  test("marks only the requested signal and family as actively checking", () => {
    expect(
      appReducer(initialAppState, {
        _tag: "CheckStarted",
        signal: "ping",
        family: "ipv4",
      }),
    ).toEqual({
      ...initialAppState,
      ping: {
        ...initialAppState.ping,
        ipv4: {
          ...initialAppState.ping.ipv4,
          isChecking: true,
        },
      },
    });
  });

  test("updates only the completed signal and family and accumulates uptime counters", () => {
    expect(
      appReducer(initialAppState, {
        _tag: "CheckCompleted",
        signal: "http",
        family: "ipv6",
        checkedAt: 123,
        result: {
          status: "offline",
          detail: "Network is unreachable",
          latencyMs: null,
        },
      }),
    ).toEqual({
      ping: initialAppState.ping,
      http: {
        ipv4: initialAppState.http.ipv4,
        ipv6: {
          status: "offline",
          isChecking: false,
          detail: "Network is unreachable",
          lastCheckedAt: 123,
          successfulChecks: 0,
          totalChecks: 1,
          latencyHistoryMs: [],
          recentChecks: [
            {
              checkedAt: 123,
              isSuccess: false,
            },
          ],
        },
      },
      startedAt: 0,
    });
  });

  test("stores recent latency history and prunes old rolling-window checks", () => {
    expect(
      appReducer(
        {
          ...initialAppState,
          ping: {
            ...initialAppState.ping,
            ipv4: {
              ...initialAppState.ping.ipv4,
              latencyHistoryMs: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
              recentChecks: [
                {
                  checkedAt: 1,
                  isSuccess: true,
                },
                {
                  checkedAt: 250_000,
                  isSuccess: false,
                },
              ],
            },
          },
        },
        {
          _tag: "CheckCompleted",
          signal: "ping",
          family: "ipv4",
          checkedAt: 310_000,
          result: {
            status: "online",
            detail: "Reply in 12.0 ms",
            latencyMs: 12,
          },
        },
      ),
    ).toEqual({
      ...initialAppState,
      ping: {
        ...initialAppState.ping,
        ipv4: {
          status: "online",
          isChecking: false,
          detail: "Reply in 12.0 ms",
          lastCheckedAt: 310_000,
          successfulChecks: 1,
          totalChecks: 1,
          latencyHistoryMs: [20, 30, 40, 50, 60, 70, 80, 90, 100, 12],
          recentChecks: [
            {
              checkedAt: 250_000,
              isSuccess: false,
            },
            {
              checkedAt: 310_000,
              isSuccess: true,
            },
          ],
        },
      },
    });
  });
});
