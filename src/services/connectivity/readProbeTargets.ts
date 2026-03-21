import type { ProbeTargets } from "../../domain/ProbeTargets";

export const readProbeTargets = (env: Record<string, string | undefined>) =>
  ({
    ipv4: env.IPCHECK_IPV4_TARGET || "1.1.1.1",
    ipv6: env.IPCHECK_IPV6_TARGET || "2001:4860:4860::8888",
  }) satisfies ProbeTargets;
