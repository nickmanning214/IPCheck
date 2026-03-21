import { describe, expect, test } from "bun:test";

import { readProbeTargets } from "../src/services/connectivity/readProbeTargets";

describe("readProbeTargets", () => {
  test("falls back to default ping and http targets", () => {
    expect(readProbeTargets({})).toEqual({
      ping: {
        ipv4: "1.1.1.1",
        ipv6: "2001:4860:4860::8888",
      },
      http: {
        ipv4: "https://api.ipify.org",
        ipv6: "https://api64.ipify.org",
      },
      direct: {
        ipv4: "https://1.1.1.1/cdn-cgi/trace",
        ipv6: "https://[2606:4700:4700::1111]/cdn-cgi/trace",
      },
    });
  });

  test("uses configured targets when provided", () => {
    expect(
      readProbeTargets({
        IPCHECK_PING_IPV4_TARGET: "8.8.8.8",
        IPCHECK_PING_IPV6_TARGET: "2001:4860:4860::8844",
        IPCHECK_HTTP_IPV4_TARGET: "https://example.com/ipv4",
        IPCHECK_HTTP_IPV6_TARGET: "https://example.com/ipv6",
        IPCHECK_DIRECT_IPV4_TARGET: "https://198.51.100.4/direct",
        IPCHECK_DIRECT_IPV6_TARGET: "https://[2001:db8::4]/direct",
      }),
    ).toEqual({
      ping: {
        ipv4: "8.8.8.8",
        ipv6: "2001:4860:4860::8844",
      },
      http: {
        ipv4: "https://example.com/ipv4",
        ipv6: "https://example.com/ipv6",
      },
      direct: {
        ipv4: "https://198.51.100.4/direct",
        ipv6: "https://[2001:db8::4]/direct",
      },
    });
  });
});
