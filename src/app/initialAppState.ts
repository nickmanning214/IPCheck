import type { AppState } from "../domain/AppState";

export const initialAppState: AppState = {
  ipv4: {
    status: "checking",
    detail: "Waiting for the first IPv4 check",
  },
  ipv6: {
    status: "checking",
    detail: "Waiting for the first IPv6 check",
  },
  checkedAt: null,
};
