import type { ProbeTargets } from "../../domain/ProbeTargets";

export const readProbeTargets = (env: Record<string, string | undefined>) =>
  ({
    ping: {
      ipv4: env.IPCHECK_PING_IPV4_TARGET || "1.1.1.1",
      ipv6: env.IPCHECK_PING_IPV6_TARGET || "2001:4860:4860::8888",
    },
    http: {
      ipv4: env.IPCHECK_HTTP_IPV4_TARGET || "https://api.ipify.org",
      ipv6: env.IPCHECK_HTTP_IPV6_TARGET || "https://api64.ipify.org",
    },
    direct: {
      ipv4: env.IPCHECK_DIRECT_IPV4_TARGET || "https://1.1.1.1/cdn-cgi/trace",
      ipv6:
        env.IPCHECK_DIRECT_IPV6_TARGET ||
        "https://[2606:4700:4700::1111]/cdn-cgi/trace",
    },
  }) satisfies ProbeTargets;
