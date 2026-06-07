import { describe, expect, test } from "bun:test";
import { Optic, pipe } from "effect";

import { appReducer } from "../src/app/appReducer";
import { initialAppState } from "../src/app/initialAppState";
import type { AppState } from "../src/domain/AppState";

pipe(Optic.id<AppState>(), (appStateOptic) =>
  describe("appReducer", () => {
    test("marks only the requested signal and family as actively checking", () => {
      expect(
        appReducer(initialAppState, {
          _tag: "CheckStarted",
          signal: "ping",
          family: "ipv4",
        }),
      ).toEqual(
        pipe(
          initialAppState,
          appStateOptic
            .key("ping")
            .key("ipv4")
            .modify((connection) => ({
              status: connection.status,
              isChecking: true,
              detail: connection.detail,
              lastCheckedAt: connection.lastCheckedAt,
              successfulChecks: connection.successfulChecks,
              totalChecks: connection.totalChecks,
              latencyHistoryMs: connection.latencyHistoryMs,
              recentChecks: connection.recentChecks,
              outageStartedAt: connection.outageStartedAt,
              outages: connection.outages,
            })),
        ),
      );
    });

    test("updates only the completed signal and family and accumulates uptime counters", () => {
      expect(
        appReducer(initialAppState, {
          _tag: "CheckCompleted",
          signal: "http",
          family: "ipv6",
          checkedAt: 123,
          result: {
            status: "offline",
            detail: "Network is unreachable",
            latencyMs: null,
          },
        }),
      ).toEqual(
        pipe(
          initialAppState,
          appStateOptic
            .key("http")
            .key("ipv6")
            .modify(() => ({
              status: "offline",
              isChecking: false,
              detail: "Network is unreachable",
              lastCheckedAt: 123,
              successfulChecks: 0,
              totalChecks: 1,
              latencyHistoryMs: [],
              outageStartedAt: 123,
              outages: [],
              recentChecks: [
                {
                  checkedAt: 123,
                  isSuccess: false,
                },
              ],
            })),
        ),
      );
    });

    test("stores recent latency history and prunes old rolling-window checks", () => {
      expect(
        appReducer(
          pipe(
            initialAppState,
            appStateOptic
              .key("ping")
              .key("ipv4")
              .modify((connection) => ({
                status: connection.status,
                isChecking: connection.isChecking,
                detail: connection.detail,
                lastCheckedAt: connection.lastCheckedAt,
                successfulChecks: connection.successfulChecks,
                totalChecks: connection.totalChecks,
                latencyHistoryMs: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                recentChecks: [
                  {
                    checkedAt: 1,
                    isSuccess: true,
                  },
                  {
                    checkedAt: 250_000,
                    isSuccess: false,
                  },
                ],
                outageStartedAt: connection.outageStartedAt,
                outages: connection.outages,
              })),
          ),
          {
            _tag: "CheckCompleted",
            signal: "ping",
            family: "ipv4",
            checkedAt: 310_000,
            result: {
              status: "online",
              detail: "Reply in 12.0 ms",
              latencyMs: 12,
            },
          },
        ),
      ).toEqual(
        pipe(
          initialAppState,
          appStateOptic
            .key("ping")
            .key("ipv4")
            .modify(() => ({
              status: "online",
              isChecking: false,
              detail: "Reply in 12.0 ms",
              lastCheckedAt: 310_000,
              successfulChecks: 1,
              totalChecks: 1,
              latencyHistoryMs: [20, 30, 40, 50, 60, 70, 80, 90, 100, 12],
              outageStartedAt: null,
              outages: [],
              recentChecks: [
                {
                  checkedAt: 250_000,
                  isSuccess: false,
                },
                {
                  checkedAt: 310_000,
                  isSuccess: true,
                },
              ],
            })),
        ),
      );
    });

    test("updates direct HTTPS checks independently from ping and hostname HTTP", () => {
      expect(
        appReducer(initialAppState, {
          _tag: "CheckCompleted",
          signal: "direct",
          family: "ipv4",
          checkedAt: 500,
          result: {
            status: "online",
            detail: "Response ip=198.51.100.20",
            latencyMs: 80,
          },
        }),
      ).toEqual(
        pipe(
          initialAppState,
          appStateOptic
            .key("direct")
            .key("ipv4")
            .modify(() => ({
              status: "online",
              isChecking: false,
              detail: "Response ip=198.51.100.20",
              lastCheckedAt: 500,
              successfulChecks: 1,
              totalChecks: 1,
              latencyHistoryMs: [80],
              outageStartedAt: null,
              outages: [],
              recentChecks: [
                {
                  checkedAt: 500,
                  isSuccess: true,
                },
              ],
            })),
        ),
      );
    });

    test("updates browser-default site checks independently from reference probes", () => {
      expect(
        appReducer(initialAppState, {
          _tag: "SiteCheckCompleted",
          site: "plaintextsports",
          checkedAt: 700,
          result: {
            status: "online",
            detail: "HTTP 200 in 95.0 ms",
            latencyMs: 95,
          },
        }),
      ).toEqual(
        pipe(
          initialAppState,
          appStateOptic
            .key("sites")
            .key("plaintextsports")
            .modify(() => ({
              status: "online",
              isChecking: false,
              detail: "HTTP 200 in 95.0 ms",
              lastCheckedAt: 700,
              successfulChecks: 1,
              totalChecks: 1,
              latencyHistoryMs: [95],
              outageStartedAt: null,
              outages: [],
              recentChecks: [
                {
                  checkedAt: 700,
                  isSuccess: true,
                },
              ],
            })),
        ),
      );
    });

    test("records completed outages and their lengths when a family recovers", () => {
      expect(
        appReducer(
          pipe(
            initialAppState,
            appStateOptic
              .key("http")
              .key("ipv4")
              .modify((connection) => ({
                status: "offline",
                isChecking: connection.isChecking,
                detail: connection.detail,
                lastCheckedAt: connection.lastCheckedAt,
                successfulChecks: connection.successfulChecks,
                totalChecks: connection.totalChecks,
                latencyHistoryMs: connection.latencyHistoryMs,
                recentChecks: connection.recentChecks,
                outageStartedAt: 1_000,
                outages: connection.outages,
              })),
          ),
          {
            _tag: "CheckCompleted",
            signal: "http",
            family: "ipv4",
            checkedAt: 4_000,
            result: {
              status: "online",
              detail: "Address 203.0.113.10",
              latencyMs: 120,
            },
          },
        ),
      ).toEqual(
        pipe(
          initialAppState,
          appStateOptic
            .key("http")
            .key("ipv4")
            .modify(() => ({
              status: "online",
              isChecking: false,
              detail: "Address 203.0.113.10",
              lastCheckedAt: 4_000,
              successfulChecks: 1,
              totalChecks: 1,
              latencyHistoryMs: [120],
              outageStartedAt: null,
              outages: [
                {
                  startedAt: 1_000,
                  endedAt: 4_000,
                  durationMs: 3_000,
                },
              ],
              recentChecks: [
                {
                  checkedAt: 4_000,
                  isSuccess: true,
                },
              ],
            })),
        ),
      );
    });
  }),
);
