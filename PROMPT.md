# IPCheck

## App Type

This project is a terminal app.

## Stack

- Runtime: Bun
- Language: TypeScript
- UI: React with Ink
- Effects and services: Effect

## Features

1. The app continuously monitors IPv4 and IPv6 connectivity in the terminal instead of running a one-shot shell script.
2. The terminal UI always shows the latest known status for IPv4 and IPv6, including whether each check is currently running, reachable, or failing.
3. The app refreshes IPv4 and IPv6 checks independently on a repeating interval without exiting on its own.
4. The UI shows the last completed check time for each family, uptime percentage since the app started, explicit run timing metadata, and keeps the terminal view readable during long-running monitoring with a compact comparison layout and a summary-first hierarchy.
5. The connectivity checks should probe IPv4 and IPv6 directly so the app can still report transport failures even when DNS is unavailable.
6. The monitor should keep the last online or offline status visible while a new probe is in flight instead of replacing everything with a blocking global checking state.
7. The app should support configurable IPv4 and IPv6 probe targets without requiring code changes.
8. The UI should show recent latency history and rolling 1-minute and 5-minute uptime windows for each family.
9. The app should support both raw reachability checks and hostname-based HTTP-style checks so browser-like slowness can be compared against basic network health.
10. HTTP probes should use bounded timeouts so a wedged web request cannot leave the monitor stuck in a polling state indefinitely.
11. The app should also support a direct-IP HTTPS probe so raw ping, hostname HTTP, and direct HTTPS can be compared side by side in the same run.
12. The default polling cadence should be once per second for each family and signal, while still allowing the interval to be configured.
13. The app should log each detected outage per family and signal, including how long the outage lasted, and surface recent outage history in the terminal UI.

## Vertical Features

### UI

- Render a persistent Ink dashboard for IPv4 and IPv6 connectivity.
- Surface per-family status, detail text, latency history, uptime percentages, target information, and last checked time in a continuously updating terminal layout.
- Surface recent outage history and active outage duration for each family so reliability problems can be tied to specific incidents rather than just percentages.
- Show when a family is actively being polled without hiding its last completed result.
- Arrange the dashboard as three side-by-side signal columns, with IPv4 and IPv6 shown next to each other inside each signal, so the full comparison fits on one screen.
- Add a compact summary row above the detailed columns that emphasizes uptime percentages instead of repeating online/offline labels, and keep probe targets in a low-emphasis footer so the main comparison area stays focused on health signals.
- Show the app start time, elapsed runtime, and polling cadence explicitly so percentages can be interpreted in the context of how much data has been collected.

### Connectivity Runtime

- Perform IPv4 and IPv6 connectivity checks through effectified external process services.
- Convert raw process results into app-friendly connectivity states.
- Probe literal IPv4 and IPv6 endpoints instead of relying on hostname resolution.
- Poll IPv4 and IPv6 independently so one slow family does not block updates for the other.
- Allow probe targets to be configured from the runtime environment.
- Support ICMP-style reachability checks, hostname-based HTTP-style checks, and direct-IP HTTPS checks for each family.
- Default to a one-second polling cadence per family and signal, while allowing overrides from app configuration.
- Bound HTTP probe duration with explicit timeouts so the UI keeps advancing even during severe slowness.

### Process Service

- Wrap external command execution behind Effect services and layers so app code does not call Bun process APIs directly.

## Horizontal Features

### Connectivity Monitoring

- Support ongoing IPv4 and IPv6 health visibility from the terminal UI through the process service and the monitoring loop.
- Track per-family uptime percentage from app start based on completed probes.
- Track per-family rolling uptime windows and recent latency history from completed probes.
- Track completed outages and their measured durations per family and signal.
- Let users compare raw network health against both browser-like hostname HTTP health and direct-IP HTTPS health in the same run.
