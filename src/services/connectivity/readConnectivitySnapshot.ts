import { Effect, pipe } from "effect";

import { readConnectionStatus } from "./readConnectionStatus";

export const readConnectivitySnapshot = () =>
  pipe(
    Effect.all(
      {
        ipv4: readConnectionStatus({ family: "ipv4" }),
        ipv6: readConnectionStatus({ family: "ipv6" }),
      },
      { concurrency: "unbounded" },
    ),
    Effect.map(({ ipv4, ipv6 }) => ({
      ipv4,
      ipv6,
      checkedAt: Date.now(),
    })),
  );
