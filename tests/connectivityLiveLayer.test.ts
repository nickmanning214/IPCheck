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
            readConnectionStatus({ family: "ipv6", signal: "ping" }),
          ),
          pipe(
            ConnectivityService.Live,
            Layer.provide(
              Layer.succeed(ProcessService, {
                run: ({ args }) =>
                  Effect.succeed(
                    args.includes("2001:4860:4860::8888")
                      ? {
                          exitCode: 1,
                          stdout: "",
                          stderr: "IPv6 unreachable",
                        }
                      : {
                          exitCode: 0,
                          stdout: "ok",
                          stderr: "",
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
