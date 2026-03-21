import { describe, expect, test } from "bun:test";
import { Effect, Layer } from "effect";
import React from "react";
import { render } from "ink-testing-library";

import { App } from "../src/app/App";
import { ConnectivityService } from "../src/services/connectivity/ConnectivityService";

describe("App", () => {
  test("renders live connectivity results in the terminal", async () => {
    const app = render(
      <App
        intervalMs={60000}
        connectivityLayer={Layer.succeed(ConnectivityService, {
          readSnapshot: () =>
            Effect.succeed({
              ipv4: {
                status: "online",
                detail: "Address 203.0.113.10",
              },
              ipv6: {
                status: "offline",
                detail: "Network is unreachable",
              },
              checkedAt: 123,
            }),
        })}
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(app.lastFrame()).toContain("IPv4");
    expect(app.lastFrame()).toContain("ONLINE");
    expect(app.lastFrame()).toContain("IPv6");
    expect(app.lastFrame()).toContain("OFFLINE");

    app.unmount();
  });
});
