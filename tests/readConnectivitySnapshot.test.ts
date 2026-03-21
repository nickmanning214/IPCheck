import { describe, expect, test } from "bun:test";
import { Effect } from "effect";

import { readConnectivitySnapshot } from "../src/services/connectivity/readConnectivitySnapshot";
import { ProcessService } from "../src/services/process/ProcessService";

describe("readConnectivitySnapshot", () => {
  test("maps successful and failed command checks into connectivity state", async () => {
    expect(
      await Effect.runPromise(
        Effect.provideService(readConnectivitySnapshot(), ProcessService, {
          run: ({ args }) =>
            Effect.succeed(
              args.includes("-4")
                ? {
                    exitCode: 0,
                    stdout: "203.0.113.10\n",
                    stderr: "",
                  }
                : {
                    exitCode: 1,
                    stdout: "",
                    stderr: "Network is unreachable",
                  },
            ),
        }),
      ),
    ).toEqual({
      ipv4: {
        status: "online",
        detail: "Address 203.0.113.10",
      },
      ipv6: {
        status: "offline",
        detail: "Network is unreachable",
      },
      checkedAt: expect.any(Number),
    });
  });
});
