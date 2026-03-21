import { Effect, Fiber, pipe } from "effect";
import { useEffect } from "react";

export const useFork = (
  effect: Effect.Effect<unknown, unknown, never>,
  deps: ReadonlyArray<unknown>,
) =>
  useEffect(
    () =>
      pipe(Effect.runFork(effect), (fiber) => () => {
        Effect.runFork(Fiber.interrupt(fiber));
      }),
    deps,
  );
