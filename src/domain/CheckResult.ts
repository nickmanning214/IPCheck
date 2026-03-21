export type CheckResult = {
  readonly status: "checking" | "online" | "offline";
  readonly detail: string;
};
