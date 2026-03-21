import { describe, expect, test } from "bun:test";
import { Effect, Layer } from "effect";
import React from "react";
import { render } from "ink-testing-library";

import { App } from "../src/app/App";
import { ConnectivityService } from "../src/services/connectivity/ConnectivityService";

describe("App", () => {
  test("renders per-family uptime and independent statuses in the terminal", async () => {
    const app = render(
      <App
        intervalMs={60000}
        connectivityLayer={Layer.succeed(ConnectivityService, {
          readConnectionStatus: ({ family }) =>
            Effect.succeed(
              family === "ipv4"
                ? {
                    status: "online",
                    detail: "Reply in 10.0 ms",
                  }
                : {
                    status: "offline",
                    detail: "Network is unreachable",
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
    expect(app.lastFrame()).toContain("Last checked at");

    app.unmount();
  });
});
