import { describe, expect, test } from "bun:test";

import { readProbeTargets } from "../src/services/connectivity/readProbeTargets";

describe("readProbeTargets", () => {
  test("falls back to default IPv4 and IPv6 targets", () => {
    expect(readProbeTargets({})).toEqual({
      ipv4: "1.1.1.1",
      ipv6: "2001:4860:4860::8888",
    });
  });

  test("uses configured targets when provided", () => {
    expect(
      readProbeTargets({
        IPCHECK_IPV4_TARGET: "8.8.8.8",
        IPCHECK_IPV6_TARGET: "2001:4860:4860::8844",
      }),
    ).toEqual({
      ipv4: "8.8.8.8",
      ipv6: "2001:4860:4860::8844",
    });
  });
});
