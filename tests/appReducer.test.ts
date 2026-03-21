import { describe, expect, test } from "bun:test";

import { appReducer } from "../src/app/appReducer";
import { initialAppState } from "../src/app/initialAppState";

describe("appReducer", () => {
  test("marks only the requested family as actively checking", () => {
    expect(
      appReducer(initialAppState, {
        _tag: "CheckStarted",
        family: "ipv4",
      }),
    ).toEqual({
      ...initialAppState,
      ipv4: {
        ...initialAppState.ipv4,
        isChecking: true,
      },
      ipv6: initialAppState.ipv6,
    });
  });

  test("updates only the completed family and accumulates uptime counters", () => {
    expect(
      appReducer(initialAppState, {
        _tag: "CheckCompleted",
        family: "ipv6",
        checkedAt: 123,
        result: {
          status: "offline",
          detail: "Network is unreachable",
        },
      }),
    ).toEqual({
      ipv4: {
        status: "unknown",
        isChecking: false,
        detail: "Waiting for the first IPv4 check",
        lastCheckedAt: null,
        successfulChecks: 0,
        totalChecks: 0,
      },
      ipv6: {
        status: "offline",
        isChecking: false,
        detail: "Network is unreachable",
        lastCheckedAt: 123,
        successfulChecks: 0,
        totalChecks: 1,
      },
      startedAt: 0,
    });
  });
});
