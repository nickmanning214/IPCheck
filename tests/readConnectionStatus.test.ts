import { describe, expect, test } from "bun:test";
import { Effect } from "effect";

import { readConnectionStatus } from "../src/services/connectivity/readConnectionStatus";
import { ProcessService } from "../src/services/process/ProcessService";

describe("readConnectionStatus", () => {
  test("uses an IPv4-specific ping probe and maps success", async () => {
    expect(
      await Effect.runPromise(
        Effect.provideService(
          readConnectionStatus({
            family: "ipv4",
            signal: "ping",
            target: "1.1.1.1",
          }),
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
      latencyMs: 12.3,
    });
  });

  test("uses an IPv6-specific ping probe and maps failures independently", async () => {
    expect(
      await Effect.runPromise(
        Effect.provideService(
          readConnectionStatus({
            family: "ipv6",
            signal: "ping",
            target: "2001:4860:4860::8888",
          }),
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
      latencyMs: null,
    });
  });

  test("uses an http-specific curl probe and maps latency", async () => {
    expect(
      await Effect.runPromise(
        Effect.provideService(
          readConnectionStatus({
            family: "ipv4",
            signal: "http",
            target: "https://api.ipify.org",
          }),
          ProcessService,
          {
            run: ({ command, args }) =>
              Effect.succeed(
                command === "curl" &&
                  args.includes("-4") &&
                  args.includes("--write-out") &&
                  args.includes("https://api.ipify.org")
                  ? {
                      exitCode: 0,
                      stdout: "203.0.113.10\n200 0.120 203.0.113.10",
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
      detail: "Address 203.0.113.10 via IPv4 203.0.113.10",
      latencyMs: 120,
    });
  });

  test("fails a forced IPv6 HTTP probe that only reaches an IPv4-mapped endpoint", async () => {
    expect(
      await Effect.runPromise(
        Effect.provideService(
          readConnectionStatus({
            family: "ipv6",
            signal: "http",
            target: "https://api64.ipify.org",
          }),
          ProcessService,
          {
            run: ({ command, args }) =>
              Effect.succeed(
                command === "curl" &&
                  args.includes("-6") &&
                  args.includes("--noproxy") &&
                  args.includes("*") &&
                  args.includes("https://api64.ipify.org")
                  ? {
                      exitCode: 0,
                      stdout: "23.25.217.174\n200 0.210 ::ffff:104.237.62.213",
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
      status: "offline",
      detail:
        "Expected native IPv6 but curl connected through IPv4-mapped ::ffff:104.237.62.213",
      latencyMs: null,
    });
  });

  test("uses a direct HTTPS curl probe independently from hostname HTTP checks", async () => {
    expect(
      await Effect.runPromise(
        Effect.provideService(
          readConnectionStatus({
            family: "ipv6",
            signal: "direct",
            target: "https://[2606:4700:4700::1111]/cdn-cgi/trace",
          }),
          ProcessService,
          {
            run: ({ command, args }) =>
              Effect.succeed(
                command === "curl" &&
                  args.includes("-6") &&
                  args.includes("--insecure") &&
                  args.includes("https://[2606:4700:4700::1111]/cdn-cgi/trace")
                  ? {
                      exitCode: 0,
                      stdout: "ip=2001:db8::10\n200 0.450 2606:4700:4700::1111",
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
      detail: "Response ip=2001:db8::10 via IPv6 2606:4700:4700::1111",
      latencyMs: 450,
    });
  });
});
