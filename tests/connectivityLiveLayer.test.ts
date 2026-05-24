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

  test("reports the address family used by browser-default site probes", async () => {
    expect(
      await Effect.runPromise(
        Effect.provide(
          Effect.flatMap(ConnectivityService, ({ readSiteStatus }) =>
            readSiteStatus({ site: "slack" }),
          ),
          pipe(
            ConnectivityService.Live,
            Layer.provide(
              Layer.succeed(ProcessService, {
                run: ({ args }) =>
                  Effect.succeed(
                    args.includes("https://slack.com") &&
                      args.includes("%{http_code} %{time_total} %{remote_ip}")
                      ? {
                          exitCode: 0,
                          stdout: "200 0.320 203.0.113.20",
                          stderr: "",
                        }
                      : {
                          exitCode: 1,
                          stdout: "",
                          stderr: "wrong command",
                        },
                  ),
              }),
            ),
          ),
        ),
      ),
    ).toEqual({
      status: "online",
      detail: "HTTP 200 via IPv4 203.0.113.20 in 320.0 ms",
      latencyMs: 320,
    });
  });
});
