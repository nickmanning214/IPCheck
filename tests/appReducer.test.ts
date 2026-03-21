import { describe, expect, test } from "bun:test";

import { appReducer } from "../src/app/appReducer";
import { initialAppState } from "../src/app/initialAppState";

describe("appReducer", () => {
  test("marks both checks as checking when a cycle starts", () => {
    expect(appReducer(initialAppState, { _tag: "CheckStarted" })).toEqual(
      initialAppState,
    );
  });

  test("replaces state with the latest snapshot", () => {
    expect(
      appReducer(initialAppState, {
        _tag: "SnapshotUpdated",
        snapshot: {
          ipv4: {
            status: "online",
            detail: "Address 203.0.113.10",
          },
          ipv6: {
            status: "offline",
            detail: "Network is unreachable",
          },
          checkedAt: 123,
        },
      }),
    ).toEqual({
      ipv4: {
        status: "online",
        detail: "Address 203.0.113.10",
      },
      ipv6: {
        status: "offline",
        detail: "Network is unreachable",
      },
      checkedAt: 123,
    });
  });
});
