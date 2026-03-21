import { Effect, pipe } from "effect";
import { useReducer } from "react";

export const useEffectReducer = <State, Action>(
  reducer: (state: State, action: Action) => State,
  initialState: State,
) =>
  pipe(useReducer(reducer, initialState), ([state, reactDispatch]) => ({
    state,
    dispatch: (action: Action) => Effect.sync(() => reactDispatch(action)),
  }));
