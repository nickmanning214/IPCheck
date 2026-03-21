import { Effect, Schema, pipe } from "effect";

import { ProcessError } from "./ProcessError";
import { ProcessResultSchema } from "./ProcessResultSchema";

export const runProcess = ({
  command,
  args,
}: {
  readonly command: string;
  readonly args: ReadonlyArray<string>;
}) =>
  Effect.tryPromise({
    try: async () =>
      pipe(
        Bun.spawn([command, ...args], {
          stdout: "pipe",
          stderr: "pipe",
        }),
        async ({ exited, stdout, stderr }) =>
          Schema.decodeUnknownSync(ProcessResultSchema)({
            exitCode: await exited,
            stdout: await new Response(stdout).text(),
            stderr: await new Response(stderr).text(),
          }),
      ),
    catch: (cause) =>
      new ProcessError({
        cause,
        command,
        args,
      }),
  });
