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
3. The app refreshes connectivity checks on a repeating interval without exiting on its own.
4. The UI shows the last completed check time and keeps the terminal view readable during long-running monitoring.
5. The connectivity checks should probe IPv4 and IPv6 directly so the app can still report transport failures even when DNS is unavailable.

## Vertical Features

### UI

- Render a persistent Ink dashboard for IPv4 and IPv6 connectivity.
- Surface check status, detail text, and last checked time in a continuously updating terminal layout.

### Connectivity Runtime

- Perform IPv4 and IPv6 connectivity checks through effectified external process services.
- Convert raw process results into app-friendly connectivity states.
- Probe literal IPv4 and IPv6 endpoints instead of relying on hostname resolution.

### Process Service

- Wrap external command execution behind Effect services and layers so app code does not call Bun process APIs directly.

## Horizontal Features

### Connectivity Monitoring

- Support ongoing IPv4 and IPv6 health visibility from the terminal UI through the process service and the monitoring loop.
