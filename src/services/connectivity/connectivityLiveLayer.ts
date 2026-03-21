import { Layer } from "effect";

import { ProcessService } from "../process/ProcessService";
import { ConnectivityService } from "./ConnectivityService";

export const connectivityLiveLayer = Layer.provide(
  ConnectivityService.Live,
  ProcessService.Live,
);
