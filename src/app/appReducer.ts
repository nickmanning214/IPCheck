import { Match, Optic, pipe } from "effect";

import type { AppAction } from "../domain/AppAction";
import type { AppState } from "../domain/AppState";

const latencyHistoryLimit = 10;
const rollingWindowLimitMs = 5 * 60 * 1000;
const outageHistoryLimit = 10;

export const appReducer = (state: AppState, action: AppAction) =>
  pipe(
    Match.value(action),
    Match.when({ _tag: "CheckStarted", signal: "ping", family: "ipv4" }, () =>
      pipe(
        state,
        Optic.id<AppState>()
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
    ),
    Match.when({ _tag: "CheckStarted", signal: "ping", family: "ipv6" }, () =>
      pipe(
        state,
        Optic.id<AppState>()
          .key("ping")
          .key("ipv6")
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
    ),
    Match.when({ _tag: "CheckStarted", signal: "http", family: "ipv4" }, () =>
      pipe(
        state,
        Optic.id<AppState>()
          .key("http")
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
    ),
    Match.when({ _tag: "CheckStarted", signal: "http", family: "ipv6" }, () =>
      pipe(
        state,
        Optic.id<AppState>()
          .key("http")
          .key("ipv6")
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
    ),
    Match.when({ _tag: "CheckStarted", signal: "direct", family: "ipv4" }, () =>
      pipe(
        state,
        Optic.id<AppState>()
          .key("direct")
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
    ),
    Match.when({ _tag: "CheckStarted", signal: "direct", family: "ipv6" }, () =>
      pipe(
        state,
        Optic.id<AppState>()
          .key("direct")
          .key("ipv6")
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
    ),
    Match.when({ _tag: "SiteCheckStarted", site: "plaintextsports" }, () =>
      pipe(
        state,
        Optic.id<AppState>()
          .key("sites")
          .key("plaintextsports")
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
    ),
    Match.when({ _tag: "SiteCheckStarted", site: "slack" }, () =>
      pipe(
        state,
        Optic.id<AppState>()
          .key("sites")
          .key("slack")
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
    ),
    Match.when(
      { _tag: "CheckCompleted", signal: "ping", family: "ipv4" },
      ({ checkedAt, result }) =>
        pipe(
          state,
          Optic.id<AppState>()
            .key("ping")
            .key("ipv4")
            .modify((connection) => ({
              status: result.status,
              isChecking: false,
              detail: result.detail,
              lastCheckedAt: checkedAt,
              successfulChecks:
                connection.successfulChecks +
                (result.status === "online" ? 1 : 0),
              totalChecks: connection.totalChecks + 1,
              latencyHistoryMs:
                result.latencyMs === null
                  ? connection.latencyHistoryMs
                  : connection.latencyHistoryMs
                      .concat(result.latencyMs)
                      .slice(-latencyHistoryLimit),
              outageStartedAt:
                result.status === "offline"
                  ? (connection.outageStartedAt ?? checkedAt)
                  : null,
              outages:
                result.status === "online" &&
                connection.status === "offline" &&
                connection.outageStartedAt !== null
                  ? connection.outages
                      .concat({
                        startedAt: connection.outageStartedAt,
                        endedAt: checkedAt,
                        durationMs: checkedAt - connection.outageStartedAt,
                      })
                      .slice(-outageHistoryLimit)
                  : connection.outages,
              recentChecks: connection.recentChecks
                .filter(
                  ({ checkedAt: sampleCheckedAt }) =>
                    sampleCheckedAt >= checkedAt - rollingWindowLimitMs,
                )
                .concat({
                  checkedAt,
                  isSuccess: result.status === "online",
                }),
            })),
        ),
    ),
    Match.when(
      { _tag: "CheckCompleted", signal: "ping", family: "ipv6" },
      ({ checkedAt, result }) =>
        pipe(
          state,
          Optic.id<AppState>()
            .key("ping")
            .key("ipv6")
            .modify((connection) => ({
              status: result.status,
              isChecking: false,
              detail: result.detail,
              lastCheckedAt: checkedAt,
              successfulChecks:
                connection.successfulChecks +
                (result.status === "online" ? 1 : 0),
              totalChecks: connection.totalChecks + 1,
              latencyHistoryMs:
                result.latencyMs === null
                  ? connection.latencyHistoryMs
                  : connection.latencyHistoryMs
                      .concat(result.latencyMs)
                      .slice(-latencyHistoryLimit),
              outageStartedAt:
                result.status === "offline"
                  ? (connection.outageStartedAt ?? checkedAt)
                  : null,
              outages:
                result.status === "online" &&
                connection.status === "offline" &&
                connection.outageStartedAt !== null
                  ? connection.outages
                      .concat({
                        startedAt: connection.outageStartedAt,
                        endedAt: checkedAt,
                        durationMs: checkedAt - connection.outageStartedAt,
                      })
                      .slice(-outageHistoryLimit)
                  : connection.outages,
              recentChecks: connection.recentChecks
                .filter(
                  ({ checkedAt: sampleCheckedAt }) =>
                    sampleCheckedAt >= checkedAt - rollingWindowLimitMs,
                )
                .concat({
                  checkedAt,
                  isSuccess: result.status === "online",
                }),
            })),
        ),
    ),
    Match.when(
      { _tag: "CheckCompleted", signal: "http", family: "ipv4" },
      ({ checkedAt, result }) =>
        pipe(
          state,
          Optic.id<AppState>()
            .key("http")
            .key("ipv4")
            .modify((connection) => ({
              status: result.status,
              isChecking: false,
              detail: result.detail,
              lastCheckedAt: checkedAt,
              successfulChecks:
                connection.successfulChecks +
                (result.status === "online" ? 1 : 0),
              totalChecks: connection.totalChecks + 1,
              latencyHistoryMs:
                result.latencyMs === null
                  ? connection.latencyHistoryMs
                  : connection.latencyHistoryMs
                      .concat(result.latencyMs)
                      .slice(-latencyHistoryLimit),
              outageStartedAt:
                result.status === "offline"
                  ? (connection.outageStartedAt ?? checkedAt)
                  : null,
              outages:
                result.status === "online" &&
                connection.status === "offline" &&
                connection.outageStartedAt !== null
                  ? connection.outages
                      .concat({
                        startedAt: connection.outageStartedAt,
                        endedAt: checkedAt,
                        durationMs: checkedAt - connection.outageStartedAt,
                      })
                      .slice(-outageHistoryLimit)
                  : connection.outages,
              recentChecks: connection.recentChecks
                .filter(
                  ({ checkedAt: sampleCheckedAt }) =>
                    sampleCheckedAt >= checkedAt - rollingWindowLimitMs,
                )
                .concat({
                  checkedAt,
                  isSuccess: result.status === "online",
                }),
            })),
        ),
    ),
    Match.when(
      { _tag: "CheckCompleted", signal: "http", family: "ipv6" },
      ({ checkedAt, result }) =>
        pipe(
          state,
          Optic.id<AppState>()
            .key("http")
            .key("ipv6")
            .modify((connection) => ({
              status: result.status,
              isChecking: false,
              detail: result.detail,
              lastCheckedAt: checkedAt,
              successfulChecks:
                connection.successfulChecks +
                (result.status === "online" ? 1 : 0),
              totalChecks: connection.totalChecks + 1,
              latencyHistoryMs:
                result.latencyMs === null
                  ? connection.latencyHistoryMs
                  : connection.latencyHistoryMs
                      .concat(result.latencyMs)
                      .slice(-latencyHistoryLimit),
              outageStartedAt:
                result.status === "offline"
                  ? (connection.outageStartedAt ?? checkedAt)
                  : null,
              outages:
                result.status === "online" &&
                connection.status === "offline" &&
                connection.outageStartedAt !== null
                  ? connection.outages
                      .concat({
                        startedAt: connection.outageStartedAt,
                        endedAt: checkedAt,
                        durationMs: checkedAt - connection.outageStartedAt,
                      })
                      .slice(-outageHistoryLimit)
                  : connection.outages,
              recentChecks: connection.recentChecks
                .filter(
                  ({ checkedAt: sampleCheckedAt }) =>
                    sampleCheckedAt >= checkedAt - rollingWindowLimitMs,
                )
                .concat({
                  checkedAt,
                  isSuccess: result.status === "online",
                }),
            })),
        ),
    ),
    Match.when(
      { _tag: "CheckCompleted", signal: "direct", family: "ipv4" },
      ({ checkedAt, result }) =>
        pipe(
          state,
          Optic.id<AppState>()
            .key("direct")
            .key("ipv4")
            .modify((connection) => ({
              status: result.status,
              isChecking: false,
              detail: result.detail,
              lastCheckedAt: checkedAt,
              successfulChecks:
                connection.successfulChecks +
                (result.status === "online" ? 1 : 0),
              totalChecks: connection.totalChecks + 1,
              latencyHistoryMs:
                result.latencyMs === null
                  ? connection.latencyHistoryMs
                  : connection.latencyHistoryMs
                      .concat(result.latencyMs)
                      .slice(-latencyHistoryLimit),
              outageStartedAt:
                result.status === "offline"
                  ? (connection.outageStartedAt ?? checkedAt)
                  : null,
              outages:
                result.status === "online" &&
                connection.status === "offline" &&
                connection.outageStartedAt !== null
                  ? connection.outages
                      .concat({
                        startedAt: connection.outageStartedAt,
                        endedAt: checkedAt,
                        durationMs: checkedAt - connection.outageStartedAt,
                      })
                      .slice(-outageHistoryLimit)
                  : connection.outages,
              recentChecks: connection.recentChecks
                .filter(
                  ({ checkedAt: sampleCheckedAt }) =>
                    sampleCheckedAt >= checkedAt - rollingWindowLimitMs,
                )
                .concat({
                  checkedAt,
                  isSuccess: result.status === "online",
                }),
            })),
        ),
    ),
    Match.when(
      { _tag: "CheckCompleted", signal: "direct", family: "ipv6" },
      ({ checkedAt, result }) =>
        pipe(
          state,
          Optic.id<AppState>()
            .key("direct")
            .key("ipv6")
            .modify((connection) => ({
              status: result.status,
              isChecking: false,
              detail: result.detail,
              lastCheckedAt: checkedAt,
              successfulChecks:
                connection.successfulChecks +
                (result.status === "online" ? 1 : 0),
              totalChecks: connection.totalChecks + 1,
              latencyHistoryMs:
                result.latencyMs === null
                  ? connection.latencyHistoryMs
                  : connection.latencyHistoryMs
                      .concat(result.latencyMs)
                      .slice(-latencyHistoryLimit),
              outageStartedAt:
                result.status === "offline"
                  ? (connection.outageStartedAt ?? checkedAt)
                  : null,
              outages:
                result.status === "online" &&
                connection.status === "offline" &&
                connection.outageStartedAt !== null
                  ? connection.outages
                      .concat({
                        startedAt: connection.outageStartedAt,
                        endedAt: checkedAt,
                        durationMs: checkedAt - connection.outageStartedAt,
                      })
                      .slice(-outageHistoryLimit)
                  : connection.outages,
              recentChecks: connection.recentChecks
                .filter(
                  ({ checkedAt: sampleCheckedAt }) =>
                    sampleCheckedAt >= checkedAt - rollingWindowLimitMs,
                )
                .concat({
                  checkedAt,
                  isSuccess: result.status === "online",
                }),
            })),
        ),
    ),
    Match.when(
      { _tag: "SiteCheckCompleted", site: "plaintextsports" },
      ({ checkedAt, result }) =>
        pipe(
          state,
          Optic.id<AppState>()
            .key("sites")
            .key("plaintextsports")
            .modify((connection) => ({
              status: result.status,
              isChecking: false,
              detail: result.detail,
              lastCheckedAt: checkedAt,
              successfulChecks:
                connection.successfulChecks +
                (result.status === "online" ? 1 : 0),
              totalChecks: connection.totalChecks + 1,
              latencyHistoryMs:
                result.latencyMs === null
                  ? connection.latencyHistoryMs
                  : connection.latencyHistoryMs
                      .concat(result.latencyMs)
                      .slice(-latencyHistoryLimit),
              outageStartedAt:
                result.status === "offline"
                  ? (connection.outageStartedAt ?? checkedAt)
                  : null,
              outages:
                result.status === "online" &&
                connection.status === "offline" &&
                connection.outageStartedAt !== null
                  ? connection.outages
                      .concat({
                        startedAt: connection.outageStartedAt,
                        endedAt: checkedAt,
                        durationMs: checkedAt - connection.outageStartedAt,
                      })
                      .slice(-outageHistoryLimit)
                  : connection.outages,
              recentChecks: connection.recentChecks
                .filter(
                  ({ checkedAt: sampleCheckedAt }) =>
                    sampleCheckedAt >= checkedAt - rollingWindowLimitMs,
                )
                .concat({
                  checkedAt,
                  isSuccess: result.status === "online",
                }),
            })),
        ),
    ),
    Match.when(
      { _tag: "SiteCheckCompleted", site: "slack" },
      ({ checkedAt, result }) =>
        pipe(
          state,
          Optic.id<AppState>()
            .key("sites")
            .key("slack")
            .modify((connection) => ({
              status: result.status,
              isChecking: false,
              detail: result.detail,
              lastCheckedAt: checkedAt,
              successfulChecks:
                connection.successfulChecks +
                (result.status === "online" ? 1 : 0),
              totalChecks: connection.totalChecks + 1,
              latencyHistoryMs:
                result.latencyMs === null
                  ? connection.latencyHistoryMs
                  : connection.latencyHistoryMs
                      .concat(result.latencyMs)
                      .slice(-latencyHistoryLimit),
              outageStartedAt:
                result.status === "offline"
                  ? (connection.outageStartedAt ?? checkedAt)
                  : null,
              outages:
                result.status === "online" &&
                connection.status === "offline" &&
                connection.outageStartedAt !== null
                  ? connection.outages
                      .concat({
                        startedAt: connection.outageStartedAt,
                        endedAt: checkedAt,
                        durationMs: checkedAt - connection.outageStartedAt,
                      })
                      .slice(-outageHistoryLimit)
                  : connection.outages,
              recentChecks: connection.recentChecks
                .filter(
                  ({ checkedAt: sampleCheckedAt }) =>
                    sampleCheckedAt >= checkedAt - rollingWindowLimitMs,
                )
                .concat({
                  checkedAt,
                  isSuccess: result.status === "online",
                }),
            })),
        ),
    ),
    Match.exhaustive,
  );
