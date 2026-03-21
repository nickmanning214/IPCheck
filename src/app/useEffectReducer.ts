import { Effect, pipe } from "effect";
import { useEffectEvent, useReducer } from "react";

export const useEffectReducer = <State, Action>(
  reducer: (state: State, action: Action) => State,
  initialState: State,
) =>
  pipe(useReducer(reducer, initialState), ([state, reactDispatch]) =>
    pipe(
      useEffectEvent((action: Action) => reactDispatch(action)),
      (dispatch) => ({
        state,
        dispatch: (action: Action) => Effect.sync(() => dispatch(action)),
      }),
    ),
  );
