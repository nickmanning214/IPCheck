import { Schema } from "effect";

export const ProcessResultSchema = Schema.Struct({
  exitCode: Schema.Number,
  stdout: Schema.String,
  stderr: Schema.String,
});

export type ProcessResult = Schema.Schema.Type<typeof ProcessResultSchema>;
