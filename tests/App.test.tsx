import { describe, expect, test } from "bun:test";
import { Effect, Layer } from "effect";
import React from "react";
import { render } from "ink-testing-library";

import { App } from "../src/app/App";
import { ConnectivityService } from "../src/services/connectivity/ConnectivityService";

describe("App", () => {
  test("renders a compact three-column comparison with side-by-side IPv4 and IPv6 cards", async () => {
    const app = render(
      <App
        intervalMs={60000}
        probeTargets={{
          ping: {
            ipv4: "8.8.8.8",
            ipv6: "2001:4860:4860::8844",
          },
          http: {
            ipv4: "https://api.ipify.org",
            ipv6: "https://api64.ipify.org",
          },
          direct: {
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
              ipv4: "https://api.ipify.org",
              ipv6: "https://api64.ipify.org",
            },
            direct: {
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
                  : signal === "http" && family === "ipv4"
                    ? {
                        status: "online",
                        detail: "Address 203.0.113.10",
                        latencyMs: 120,
                      }
                    : signal === "http"
                      ? {
                          status: "offline",
                          detail: "Connection timed out",
                          latencyMs: null,
                        }
                      : family === "ipv4"
                        ? {
                            status: "online",
                            detail: "Response ip=198.51.100.20",
                            latencyMs: 80,
                          }
                        : {
                            status: "offline",
                            detail: "SSL connection timeout",
                            latencyMs: null,
                          },
            ),
        })}
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(app.lastFrame()).toContain("Ping");
    expect(app.lastFrame()).toContain("HTTP");
    expect(app.lastFrame()).toContain("Direct HTTPS");
    expect(app.lastFrame()).toContain("IPv4");
    expect(app.lastFrame()).toContain("IPv6");
    expect(app.lastFrame()).toContain("Up: 100.0%");
    expect(app.lastFrame()).toContain("1m: 100.0%");
    expect(app.lastFrame()).toContain("5m: 100.0%");
    expect(app.lastFrame()).toContain("Up: 0.0%");
    expect(app.lastFrame()).toContain("latency: 10.0");
    expect(app.lastFrame()).toContain("latency: 120.0");
    expect(app.lastFrame()).toContain("latency: 80.0");
    expect(app.lastFrame()).toContain("Last checked");
    expect(app.lastFrame()).toContain("Ping IPv4 target:");
    expect(app.lastFrame()).toContain("8.8.8.8");
    expect(app.lastFrame()).toContain("Ping IPv6 target:");
    expect(app.lastFrame()).toContain("2001:4860:4860::8844");
    expect(app.lastFrame()).toContain("HTTP IPv4 target:");
    expect(app.lastFrame()).toContain("https://api.ipify.org");
    expect(app.lastFrame()).toContain("HTTP IPv6 target:");
    expect(app.lastFrame()).toContain("https://api64.ipify.org");
    expect(app.lastFrame()).toContain("Direct HTTPS IPv4 target:");
    expect(app.lastFrame()).toContain("1.1.1.1/cdn-cgi/trace");
    expect(app.lastFrame()).toContain("Direct HTTPS IPv6 target:");
    expect(app.lastFrame()).toContain("2606:4700:4700::111");
    expect(app.lastFrame()).toContain("Address");
    expect(app.lastFrame()).toContain("203.0.113.10");
    expect(app.lastFrame()).toContain("Response");
    expect(app.lastFrame()).toContain("8.51.100.20");

    app.unmount();
  });
});
