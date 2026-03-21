import { describe, expect, test } from "bun:test";
import { Effect, Layer } from "effect";
import React from "react";
import { render } from "ink-testing-library";

import { App } from "../src/app/App";
import { ConnectivityService } from "../src/services/connectivity/ConnectivityService";

describe("App", () => {
  test("renders targets, latency history, and rolling uptime windows", async () => {
    const app = render(
      <App
        intervalMs={60000}
        probeTargets={{
          ipv4: "8.8.8.8",
          ipv6: "2001:4860:4860::8844",
        }}
        connectivityLayer={Layer.succeed(ConnectivityService, {
          targets: {
            ipv4: "8.8.8.8",
            ipv6: "2001:4860:4860::8844",
          },
          readConnectionStatus: ({ family }) =>
            Effect.succeed(
              family === "ipv4"
                ? {
                    status: "online",
                    detail: "Reply in 10.0 ms",
                    latencyMs: 10,
                  }
                : {
                    status: "offline",
                    detail: "Network is unreachable",
                    latencyMs: null,
                  },
            ),
        })}
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(app.lastFrame()).toContain("IPv4");
    expect(app.lastFrame()).toContain("ONLINE");
    expect(app.lastFrame()).toContain("IPv6");
    expect(app.lastFrame()).toContain("OFFLINE");
    expect(app.lastFrame()).toContain("Uptime since start: 100.0%");
    expect(app.lastFrame()).toContain("Uptime since start: 0.0%");
    expect(app.lastFrame()).toContain("1m uptime");
    expect(app.lastFrame()).toContain("5m uptime");
    expect(app.lastFrame()).toContain("Recent latency: 10.0 ms");
    expect(app.lastFrame()).toContain("Last checked at");
    expect(app.lastFrame()).toContain("IPv4 target: 8.8.8.8");
    expect(app.lastFrame()).toContain("IPv6 target: 2001:4860:4860::8844");

    app.unmount();
  });
});
