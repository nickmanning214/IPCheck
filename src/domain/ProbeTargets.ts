export type ProbeTargets = {
  readonly ping: {
    readonly ipv4: string;
    readonly ipv6: string;
  };
  readonly http: {
    readonly ipv4: string;
    readonly ipv6: string;
  };
};
