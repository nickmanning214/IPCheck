import { Match, pipe } from "effect";

import type { AppAction } from "../domain/AppAction";
import type { AppState } from "../domain/AppState";

const latencyHistoryLimit = 10;
const rollingWindowLimitMs = 5 * 60 * 1000;

export const appReducer = (state: AppState, action: AppAction) =>
  pipe(
    Match.value(action),
    Match.when(
      { _tag: "CheckStarted", signal: "ping", family: "ipv4" },
      () => ({
        ...state,
        ping: {
          ...state.ping,
          ipv4: {
            ...state.ping.ipv4,
            isChecking: true,
          },
        },
      }),
    ),
    Match.when(
      { _tag: "CheckStarted", signal: "ping", family: "ipv6" },
      () => ({
        ...state,
        ping: {
          ...state.ping,
          ipv6: {
            ...state.ping.ipv6,
            isChecking: true,
          },
        },
      }),
    ),
    Match.when(
      { _tag: "CheckStarted", signal: "http", family: "ipv4" },
      () => ({
        ...state,
        http: {
          ...state.http,
          ipv4: {
            ...state.http.ipv4,
            isChecking: true,
          },
        },
      }),
    ),
    Match.when(
      { _tag: "CheckStarted", signal: "http", family: "ipv6" },
      () => ({
        ...state,
        http: {
          ...state.http,
          ipv6: {
            ...state.http.ipv6,
            isChecking: true,
          },
        },
      }),
    ),
    Match.when(
      { _tag: "CheckStarted", signal: "direct", family: "ipv4" },
      () => ({
        ...state,
        direct: {
          ...state.direct,
          ipv4: {
            ...state.direct.ipv4,
            isChecking: true,
          },
        },
      }),
    ),
    Match.when(
      { _tag: "CheckStarted", signal: "direct", family: "ipv6" },
      () => ({
        ...state,
        direct: {
          ...state.direct,
          ipv6: {
            ...state.direct.ipv6,
            isChecking: true,
          },
        },
      }),
    ),
    Match.when(
      { _tag: "CheckCompleted", signal: "ping", family: "ipv4" },
      ({ checkedAt, result }) => ({
        ...state,
        ping: {
          ...state.ping,
          ipv4: {
            ...state.ping.ipv4,
            status: result.status,
            isChecking: false,
            detail: result.detail,
            lastCheckedAt: checkedAt,
            successfulChecks:
              state.ping.ipv4.successfulChecks +
              (result.status === "online" ? 1 : 0),
            totalChecks: state.ping.ipv4.totalChecks + 1,
            latencyHistoryMs:
              result.latencyMs === null
                ? state.ping.ipv4.latencyHistoryMs
                : [...state.ping.ipv4.latencyHistoryMs, result.latencyMs].slice(
                    -latencyHistoryLimit,
                  ),
            recentChecks: [
              ...state.ping.ipv4.recentChecks.filter(
                ({ checkedAt: sampleCheckedAt }) =>
                  sampleCheckedAt >= checkedAt - rollingWindowLimitMs,
              ),
              {
                checkedAt,
                isSuccess: result.status === "online",
              },
            ],
          },
        },
      }),
    ),
    Match.when(
      { _tag: "CheckCompleted", signal: "ping", family: "ipv6" },
      ({ checkedAt, result }) => ({
        ...state,
        ping: {
          ...state.ping,
          ipv6: {
            ...state.ping.ipv6,
            status: result.status,
            isChecking: false,
            detail: result.detail,
            lastCheckedAt: checkedAt,
            successfulChecks:
              state.ping.ipv6.successfulChecks +
              (result.status === "online" ? 1 : 0),
            totalChecks: state.ping.ipv6.totalChecks + 1,
            latencyHistoryMs:
              result.latencyMs === null
                ? state.ping.ipv6.latencyHistoryMs
                : [...state.ping.ipv6.latencyHistoryMs, result.latencyMs].slice(
                    -latencyHistoryLimit,
                  ),
            recentChecks: [
              ...state.ping.ipv6.recentChecks.filter(
                ({ checkedAt: sampleCheckedAt }) =>
                  sampleCheckedAt >= checkedAt - rollingWindowLimitMs,
              ),
              {
                checkedAt,
                isSuccess: result.status === "online",
              },
            ],
          },
        },
      }),
    ),
    Match.when(
      { _tag: "CheckCompleted", signal: "http", family: "ipv4" },
      ({ checkedAt, result }) => ({
        ...state,
        http: {
          ...state.http,
          ipv4: {
            ...state.http.ipv4,
            status: result.status,
            isChecking: false,
            detail: result.detail,
            lastCheckedAt: checkedAt,
            successfulChecks:
              state.http.ipv4.successfulChecks +
              (result.status === "online" ? 1 : 0),
            totalChecks: state.http.ipv4.totalChecks + 1,
            latencyHistoryMs:
              result.latencyMs === null
                ? state.http.ipv4.latencyHistoryMs
                : [...state.http.ipv4.latencyHistoryMs, result.latencyMs].slice(
                    -latencyHistoryLimit,
                  ),
            recentChecks: [
              ...state.http.ipv4.recentChecks.filter(
                ({ checkedAt: sampleCheckedAt }) =>
                  sampleCheckedAt >= checkedAt - rollingWindowLimitMs,
              ),
              {
                checkedAt,
                isSuccess: result.status === "online",
              },
            ],
          },
        },
      }),
    ),
    Match.when(
      { _tag: "CheckCompleted", signal: "http", family: "ipv6" },
      ({ checkedAt, result }) => ({
        ...state,
        http: {
          ...state.http,
          ipv6: {
            ...state.http.ipv6,
            status: result.status,
            isChecking: false,
            detail: result.detail,
            lastCheckedAt: checkedAt,
            successfulChecks:
              state.http.ipv6.successfulChecks +
              (result.status === "online" ? 1 : 0),
            totalChecks: state.http.ipv6.totalChecks + 1,
            latencyHistoryMs:
              result.latencyMs === null
                ? state.http.ipv6.latencyHistoryMs
                : [...state.http.ipv6.latencyHistoryMs, result.latencyMs].slice(
                    -latencyHistoryLimit,
                  ),
            recentChecks: [
              ...state.http.ipv6.recentChecks.filter(
                ({ checkedAt: sampleCheckedAt }) =>
                  sampleCheckedAt >= checkedAt - rollingWindowLimitMs,
              ),
              {
                checkedAt,
                isSuccess: result.status === "online",
              },
            ],
          },
        },
      }),
    ),
    Match.when(
      { _tag: "CheckCompleted", signal: "direct", family: "ipv4" },
      ({ checkedAt, result }) => ({
        ...state,
        direct: {
          ...state.direct,
          ipv4: {
            ...state.direct.ipv4,
            status: result.status,
            isChecking: false,
            detail: result.detail,
            lastCheckedAt: checkedAt,
            successfulChecks:
              state.direct.ipv4.successfulChecks +
              (result.status === "online" ? 1 : 0),
            totalChecks: state.direct.ipv4.totalChecks + 1,
            latencyHistoryMs:
              result.latencyMs === null
                ? state.direct.ipv4.latencyHistoryMs
                : [
                    ...state.direct.ipv4.latencyHistoryMs,
                    result.latencyMs,
                  ].slice(-latencyHistoryLimit),
            recentChecks: [
              ...state.direct.ipv4.recentChecks.filter(
                ({ checkedAt: sampleCheckedAt }) =>
                  sampleCheckedAt >= checkedAt - rollingWindowLimitMs,
              ),
              {
                checkedAt,
                isSuccess: result.status === "online",
              },
            ],
          },
        },
      }),
    ),
    Match.when(
      { _tag: "CheckCompleted", signal: "direct", family: "ipv6" },
      ({ checkedAt, result }) => ({
        ...state,
        direct: {
          ...state.direct,
          ipv6: {
            ...state.direct.ipv6,
            status: result.status,
            isChecking: false,
            detail: result.detail,
            lastCheckedAt: checkedAt,
            successfulChecks:
              state.direct.ipv6.successfulChecks +
              (result.status === "online" ? 1 : 0),
            totalChecks: state.direct.ipv6.totalChecks + 1,
            latencyHistoryMs:
              result.latencyMs === null
                ? state.direct.ipv6.latencyHistoryMs
                : [
                    ...state.direct.ipv6.latencyHistoryMs,
                    result.latencyMs,
                  ].slice(-latencyHistoryLimit),
            recentChecks: [
              ...state.direct.ipv6.recentChecks.filter(
                ({ checkedAt: sampleCheckedAt }) =>
                  sampleCheckedAt >= checkedAt - rollingWindowLimitMs,
              ),
              {
                checkedAt,
                isSuccess: result.status === "online",
              },
            ],
          },
        },
      }),
    ),
    Match.exhaustive,
  );
