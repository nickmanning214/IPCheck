import { Schema } from "effect";

export const CheckResultSchema = Schema.Struct({
  status: Schema.Literal("online", "offline"),
  detail: Schema.String,
  latencyMs: Schema.NullOr(Schema.Number),
});

export type CheckResult = Schema.Schema.Type<typeof CheckResultSchema>;
