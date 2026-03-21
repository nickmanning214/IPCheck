import { describe, expect, test } from "bun:test";
import { Effect } from "effect";

import { readConnectionStatus } from "../src/services/connectivity/readConnectionStatus";
import { ProcessService } from "../src/services/process/ProcessService";

describe("readConnectionStatus", () => {
  test("uses an IPv4-specific probe and maps success", async () => {
    expect(
      await Effect.runPromise(
        Effect.provideService(
          readConnectionStatus({ family: "ipv4" }),
          ProcessService,
          {
            run: ({ command, args }) =>
              Effect.succeed(
                command === "ping" &&
                  args.includes("1.1.1.1") &&
                  args.includes("-c") &&
                  args.includes("1")
                  ? {
                      exitCode: 0,
                      stdout:
                        "64 bytes from 1.1.1.1: icmp_seq=0 ttl=57 time=12.3 ms",
                      stderr: "",
                    }
                  : {
                      exitCode: 1,
                      stdout: "",
                      stderr: "wrong command",
                    },
              ),
          },
        ),
      ),
    ).toEqual({
      status: "online",
      detail: "Reply in 12.3 ms",
    });
  });

  test("uses an IPv6-specific probe and maps failures independently", async () => {
    expect(
      await Effect.runPromise(
        Effect.provideService(
          readConnectionStatus({ family: "ipv6" }),
          ProcessService,
          {
            run: ({ command, args }) =>
              Effect.succeed(
                command === "ping6" &&
                  args.includes("2001:4860:4860::8888") &&
                  args.includes("-c") &&
                  args.includes("1")
                  ? {
                      exitCode: 2,
                      stdout: "",
                      stderr: "sendto: No route to host",
                    }
                  : {
                      exitCode: 1,
                      stdout: "",
                      stderr: "wrong command",
                    },
              ),
          },
        ),
      ),
    ).toEqual({
      status: "offline",
      detail: "sendto: No route to host",
    });
  });
});
