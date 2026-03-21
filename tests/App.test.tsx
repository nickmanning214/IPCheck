import { describe, expect, test } from "bun:test";
import { Effect, Layer } from "effect";
import React from "react";
import { render } from "ink-testing-library";

import { App } from "../src/app/App";
import { ConnectivityService } from "../src/services/connectivity/ConnectivityService";

describe("App", () => {
  test("renders ping and http targets, latency history, and rolling uptime windows", async () => {
    const app = render(
      <App
        intervalMs={60000}
        probeTargets={{
          ping: {
            ipv4: "8.8.8.8",
            ipv6: "2001:4860:4860::8844",
          },
          http: {
            ipv4: "https://1.1.1.1/cdn-cgi/trace",
            ipv6: "https://[2606:4700:4700::1111]/cdn-cgi/trace",
          },
        }}
        connectivityLayer={Layer.succeed(ConnectivityService, {
          targets: {
            ping: {
              ipv4: "8.8.8.8",
              ipv6: "2001:4860:4860::8844",
            },
            http: {
              ipv4: "https://1.1.1.1/cdn-cgi/trace",
              ipv6: "https://[2606:4700:4700::1111]/cdn-cgi/trace",
            },
          },
          readConnectionStatus: ({ family, signal }) =>
            Effect.succeed(
              signal === "ping" && family === "ipv4"
                ? {
                    status: "online",
                    detail: "Reply in 10.0 ms",
                    latencyMs: 10,
                  }
                : signal === "ping"
                  ? {
                      status: "offline",
                      detail: "Network is unreachable",
                      latencyMs: null,
                    }
                  : family === "ipv4"
                    ? {
                        status: "online",
                        detail: "HTTP 200 in 120.0 ms",
                        latencyMs: 120,
                      }
                    : {
                        status: "offline",
                        detail: "Connection timed out",
                        latencyMs: null,
                      },
            ),
        })}
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(app.lastFrame()).toContain("Ping");
    expect(app.lastFrame()).toContain("HTTP");
    expect(app.lastFrame()).toContain("Uptime since start: 100.0%");
    expect(app.lastFrame()).toContain("Uptime since start: 0.0%");
    expect(app.lastFrame()).toContain("1m uptime");
    expect(app.lastFrame()).toContain("5m uptime");
    expect(app.lastFrame()).toContain("Recent latency: 10.0 ms");
    expect(app.lastFrame()).toContain("Recent latency: 120.0 ms");
    expect(app.lastFrame()).toContain("Last checked at");
    expect(app.lastFrame()).toContain("Ping IPv4 target: 8.8.8.8");
    expect(app.lastFrame()).toContain("Ping IPv6 target: 2001:4860:4860::8844");
    expect(app.lastFrame()).toContain(
      "HTTP IPv4 target: https://1.1.1.1/cdn-cgi/trace",
    );
    expect(app.lastFrame()).toContain(
      "HTTP IPv6 target: https://[2606:4700:4700::1111]/cdn-cgi/trace",
    );

    app.unmount();
  });
});
