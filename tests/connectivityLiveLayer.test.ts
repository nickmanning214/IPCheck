import { describe, expect, test } from "bun:test";
import { Effect, Layer, pipe } from "effect";

import { ConnectivityService } from "../src/services/connectivity/ConnectivityService";
import { ProcessService } from "../src/services/process/ProcessService";

describe("connectivityLiveLayer", () => {
  test("provides the connectivity service when the process layer is injected", async () => {
    expect(
      await Effect.runPromise(
        Effect.provide(
          Effect.flatMap(ConnectivityService, ({ readConnectionStatus }) =>
            readConnectionStatus({ family: "ipv6" }),
          ),
          pipe(
            ConnectivityService.Live,
            Layer.provide(
              Layer.succeed(ProcessService, {
                run: ({ args }) =>
                  Effect.succeed(
                    args.includes("1.1.1.1")
                      ? {
                          exitCode: 0,
                          stdout: "ok",
                          stderr: "",
                        }
                      : {
                          exitCode: 1,
                          stdout: "",
                          stderr: "IPv6 unreachable",
                        },
                  ),
              }),
            ),
          ),
        ),
      ),
    ).toEqual({
      status: "offline",
      detail: "IPv6 unreachable",
      latencyMs: null,
    });
  });
});
