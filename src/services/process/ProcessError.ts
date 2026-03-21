import { Data } from "effect";

export class ProcessError extends Data.TaggedError("ProcessError")<{
  readonly cause: unknown;
  readonly command: string;
  readonly args: ReadonlyArray<string>;
}> {}
