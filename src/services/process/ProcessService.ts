import type { Effect as Fx } from "effect";
import { Context, Layer } from "effect";

import { ProcessError } from "./ProcessError";
import type { ProcessResult } from "./ProcessResultSchema";
import { runProcess } from "./runProcess";

export class ProcessService extends Context.Service<
  ProcessService,
  {
    readonly run: (input: {
      readonly command: string;
      readonly args: ReadonlyArray<string>;
    }) => Fx.Effect<ProcessResult, ProcessError>;
  }
>()("ProcessService") {
  static Live = Layer.succeed(ProcessService, { run: runProcess });
}
