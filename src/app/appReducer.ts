import { Match, Optic, pipe } from "effect";

import type { AppAction } from "../domain/AppAction";
import type { AppState } from "../domain/AppState";
import type { CheckResult } from "../domain/CheckResult";
import type { ConnectionState } from "../domain/ConnectionState";
import type { Family } from "../domain/Family";
import type { Signal } from "../domain/Signal";
import type { SiteKey } from "../domain/SiteKey";

const latencyHistoryLimit = 10;
const rollingWindowLimitMs = 5 * 60 * 1000;
const outageHistoryLimit = 10;

const connectionStateLens = ({
  family,
  signal,
}: {
  readonly family: Family;
  readonly signal: Signal;
}) => Optic.id<AppState>().key(signal).key(family);

const siteStateLens = ({ site }: { readonly site: SiteKey }) =>
  Optic.id<AppState>().key("sites").key(site);

const updateConnectionState = ({
  family,
  signal,
  state,
  update,
}: {
  readonly family: Family;
  readonly signal: Signal;
  readonly state: AppState;
  readonly update: (connection: ConnectionState) => ConnectionState;
}) => connectionStateLens({ family, signal }).modify(update)(state);

const updateSiteState = ({
  site,
  state,
  update,
}: {
  readonly site: SiteKey;
  readonly state: AppState;
  readonly update: (connection: ConnectionState) => ConnectionState;
}) => siteStateLens({ site }).modify(update)(state);

const readSuccessfulChecks = ({
  connection,
  result,
}: {
  readonly connection: ConnectionState;
  readonly result: CheckResult;
}) =>
  pipe(
    Match.value(result.status),
    Match.when("online", () => connection.successfulChecks + 1),
    Match.when("offline", () => connection.successfulChecks),
    Match.exhaustive,
  );

const readLatencyHistoryMs = ({
  connection,
  result,
}: {
  readonly connection: ConnectionState;
  readonly result: CheckResult;
}) =>
  result.latencyMs === null
    ? connection.latencyHistoryMs
    : connection.latencyHistoryMs
        .concat(result.latencyMs)
        .slice(-latencyHistoryLimit);

const readOutageStartedAt = ({
  checkedAt,
  connection,
  result,
}: {
  readonly checkedAt: number;
  readonly connection: ConnectionState;
  readonly result: CheckResult;
}) =>
  pipe(
    Match.value(result.status),
    Match.when("offline", () =>
      connection.outageStartedAt === null
        ? checkedAt
        : connection.outageStartedAt,
    ),
    Match.when("online", () => null),
    Match.exhaustive,
  );

const readOutages = ({
  checkedAt,
  connection,
  result,
}: {
  readonly checkedAt: number;
  readonly connection: ConnectionState;
  readonly result: CheckResult;
}) =>
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
    : connection.outages;

const readRecentChecks = ({
  checkedAt,
  result,
  connection,
}: {
  readonly checkedAt: number;
  readonly result: CheckResult;
  readonly connection: ConnectionState;
}) =>
  connection.recentChecks
    .filter(
      ({ checkedAt: sampleCheckedAt }) =>
        sampleCheckedAt >= checkedAt - rollingWindowLimitMs,
    )
    .concat({
      checkedAt,
      isSuccess: result.status === "online",
    });

const markConnectionChecking = (connection: ConnectionState) => ({
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
});

const completeConnectionCheck =
  ({
    checkedAt,
    result,
  }: {
    readonly checkedAt: number;
    readonly result: CheckResult;
  }) =>
  (connection: ConnectionState) => ({
    status: result.status,
    isChecking: false,
    detail: result.detail,
    lastCheckedAt: checkedAt,
    successfulChecks: readSuccessfulChecks({ connection, result }),
    totalChecks: connection.totalChecks + 1,
    latencyHistoryMs: readLatencyHistoryMs({ connection, result }),
    recentChecks: readRecentChecks({ checkedAt, connection, result }),
    outageStartedAt: readOutageStartedAt({ checkedAt, connection, result }),
    outages: readOutages({ checkedAt, connection, result }),
  });

export const appReducer = (state: AppState, action: AppAction) =>
  pipe(
    Match.value(action),
    Match.when({ _tag: "CheckStarted" }, ({ family, signal }) =>
      updateConnectionState({
        family,
        signal,
        state,
        update: markConnectionChecking,
      }),
    ),
    Match.when({ _tag: "SiteCheckStarted" }, ({ site }) =>
      updateSiteState({
        site,
        state,
        update: markConnectionChecking,
      }),
    ),
    Match.when(
      { _tag: "CheckCompleted" },
      ({ checkedAt, family, result, signal }) =>
        updateConnectionState({
          family,
          signal,
          state,
          update: completeConnectionCheck({ checkedAt, result }),
        }),
    ),
    Match.when({ _tag: "SiteCheckCompleted" }, ({ checkedAt, result, site }) =>
      updateSiteState({
        site,
        state,
        update: completeConnectionCheck({ checkedAt, result }),
      }),
    ),
    Match.exhaustive,
  );
