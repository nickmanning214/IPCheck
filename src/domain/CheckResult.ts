export type CheckResult = {
  readonly status: "online" | "offline";
  readonly detail: string;
};
