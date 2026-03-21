import { Layer, pipe } from "effect";

import { ProcessService } from "../process/ProcessService";
import { ConnectivityService } from "./ConnectivityService";

export const connectivityLiveLayer = pipe(
  ConnectivityService.Live,
  Layer.provide(ProcessService.Live),
);
